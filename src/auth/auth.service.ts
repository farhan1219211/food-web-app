import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entity/auth.entity';
import { IsNull, Repository } from 'typeorm';
import { CreateAuthDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login-auth.dto';
import { SessionService } from 'src/session/session.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ValidatateTokenDto } from './dto/validate-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { Role } from 'src/common/enum/role.enum';
import { EmailService } from 'src/email/email.service';
import { toUserResponse, UserResponse } from 'src/common/utils/user.mapper';
import { RestaurantService } from 'src/restaurant/restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Auth) private authRepository: Repository<Auth>,
        private readonly sessionService: SessionService,
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly email: EmailService,
        private readonly restaurantService: RestaurantService
    ) {}

    // create new account
    async createAuthUser(createAuthDto: CreateAuthDto): Promise<Auth> {
        try {
            const { email, password } = createAuthDto;

            // check for existing email
            const existing = await this.authRepository.findOne({ where: { email } });
            if (existing) {
                throw new BadRequestException('Email already exists');
            }

            // hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            const authUser = this.authRepository.create({
                email,
                password: hashedPassword,
            });

            return this.authRepository.save(authUser);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // signup for customers
    async createUser(createUserDto: CreateUserDto, role: Role): Promise<UserResponse> {
        try {
            //  create new
            const authUser: Auth = await this.createAuthUser({
                email: createUserDto.email,
                password: createUserDto.password,
            });

            if (!authUser) {
                throw new BadRequestException('Failed to create auth user');
            }

            // user profile creation
            const savedUser = await this.userService.createUserProfile(
                createUserDto,
                authUser,
                role,
            );
            if (!savedUser) {
                throw new BadRequestException('Failed to create Profile');
            }
            // user response
            return toUserResponse(savedUser);
        } catch (error) {
            throw new BadRequestException(error.message || 'Failed to create user');
        }
    }

    // create restaurant admin (only role that is going to be assigned is ROLE.RESTAURANT_ADMIN)
    async createRestaurantAdmin(
        dto: CreateRestaurantDto,
        superAdminEmail: string,
    ) {
        try {
            // create an auth account first
            const authUser = await this.createAuthUser({
                email: dto.email,
                password: dto.password,
            });
            if (!authUser) {
                throw new BadRequestException('Failed to save email and password');
            }

            // profile creation
            const savedUser = await this.userService.createUserProfile(
                dto,
                authUser,
                Role.RESTAURANT_ADMIN,
            );
            if (!savedUser) {
                throw new BadRequestException('Failed to create Profile');
            }
            // creating profile of restaurant 
            await this.restaurantService.create(dto, savedUser);
            // email part credentials
            await this.email.sendRestaurantAdminCreationEmail(
                savedUser.auth.email,
                dto.password,
                superAdminEmail,
            );
        } catch (error) {
            throw new UnauthorizedException(error.message || 'Failed to create restaurant admin');
        }
    }

    // signup super admin account
    async createSuperAdmin(createUserDto: CreateUserDto, superAdminEmail: string, role: Role ): Promise<UserResponse> {
        try {
            // create an auth account first
            const authUser = await this.createAuthUser({
                email: createUserDto.email,
                password: createUserDto.password,
            });
            if (!authUser) {
                throw new BadRequestException('Failed to save email and password');
            }

            // profile creation
            const savedUser = await this.userService.createUserProfile(
                createUserDto,
                authUser,
                role,
            );
            if (!savedUser) {
                throw new BadRequestException('Failed to create Profile');
            }
            // email part credentials
            await this.email.sendSuperAdminCreationEmail(
                savedUser.auth.email,
                createUserDto.password,
                superAdminEmail,
            );

            return toUserResponse(savedUser);
        } catch (error) {
            throw new UnauthorizedException(error.message || 'Failed to create restaurant admin');
        }
    }

    // login user
    async loginUser(loginDto: LoginDto) {
        try {
            const authUser = await this.authRepository.findOne({
                where: {
                    email: loginDto.email,
                    user: { deletedAt: IsNull() },
                },
                relations: ['user'],
            });
            if (!authUser || !authUser.user) {
                throw new NotFoundException('Invalid email');
            }

            const isMatch = await bcrypt.compare(loginDto.password, authUser.password);
            if (!isMatch) {
                throw new BadRequestException('Invalid password');
            }

            const payload = {
                id: authUser.user.id,
                email: authUser.email,
                role: authUser.user.role,
            };

            const [accessToken, refreshToken] = await Promise.all([
                this.jwtService.signAsync(payload, {
                    expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES') || '1d',
                    secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                }),
                this.jwtService.signAsync(payload, {
                    expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES') || '7d',
                    secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                }),
            ]);

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            await this.sessionService.createSession({
                user: authUser.user,
                accessToken,
                refreshToken,
                expiresAt,
            });

            return {
                user: toUserResponse(authUser.user),
                accessToken,
                refreshToken,
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // logout user
    async logout(accessToken: string) {
        return this.sessionService.deleteSessionByToken(accessToken);
    }

    // forgot password
    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        try {
            const user = await this.authRepository.findOne({
                where: { email: forgotPasswordDto.email },
            });
            if (!user) {
                throw new NotFoundException('Email does not exist');
            }
            const resetToken = Math.random().toString(36).slice(2, 14);
            user.resetPasswordToken = resetToken;
            const expires = new Date();
            expires.setMinutes(expires.getMinutes() + 5);
            user.expiresAt = expires;

            await this.authRepository.save(user);
            await this.email.sendResetPasswordEmail(user.email, resetToken);
            return {
                message: `Password reset token generated. Token is: ${resetToken}`,
                expiresInMinutes: 5,
            };
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }

    // validtion for forgot password access token
    async validateResetToken(validatateTokenDto: ValidatateTokenDto) {
        try {
            const user = await this.authRepository.findOne({
                where: { email: validatateTokenDto.email },
            });
            if (!user) {
                throw new NotFoundException('Email does not exist');
            }

            if (user.resetPasswordToken !== validatateTokenDto.token) {
                throw new BadRequestException('Invalid reset token');
            }
            if (!user.expiresAt) {
                throw new BadRequestException('No reset token timestamp found');
            }

            if (user.expiresAt && new Date() > user.expiresAt) {
                throw new BadRequestException('Reset token expired');
            }
            return {
                message: 'Token is valid. You can now reset your password.',
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // reset password
    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        try {
            const user = await this.authRepository.findOne({
                where: { email: resetPasswordDto.email },
            });
            if (!user) {
                throw new NotFoundException('Email does not exist');
            }

            if (user.resetPasswordToken !== resetPasswordDto.token) {
                throw new BadRequestException('Invalid reset token');
            }

            if (!user.resetPasswordToken) {
                throw new BadRequestException('No reset token timestamp found');
            }

            if (user.expiresAt && new Date() > user.expiresAt) {
                throw new BadRequestException('Reset token expired');
            }
            const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
            user.password = hashedPassword;
            user.resetPasswordToken = null;
            user.expiresAt = null;

            await this.authRepository.save(user);

            return {
                message: 'Password has been reset successfully.',
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
