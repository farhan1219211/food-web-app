import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entity/auth.entity';
import { Repository } from 'typeorm';
import { CreateAuthDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login-auth.dto';
import { SessionService } from 'src/session/session.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { EmailService } from 'src/email/email.service';
import { ValidatateTokenDto } from './dto/validate-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
    constructor(@InjectRepository(Auth) private authRepository: Repository<Auth>,
            private readonly jwtService: JwtService,
            private readonly sessionService: SessionService,
            private readonly emailService: EmailService,
            private readonly configService: ConfigService){}

    // create new account
    async createAuthUser(createAuthDto: CreateAuthDto): Promise<Auth> {
        const { email, password, role} = createAuthDto;

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
        role: role
        });

        return this.authRepository.save(authUser);
    }

    // login user
    async loginUser(loginDto: LoginDto){
        try {
            const authUser = await this.authRepository.findOne({
            where: { email: loginDto.email },
            });

            if (!authUser) {
            throw new NotFoundException('Invalid email');
            }

            const isMatch = await bcrypt.compare(loginDto.password, authUser.password);
            if (!isMatch) {
            throw new BadRequestException('Invalid credentials');
            }

            const payload = { sub: authUser.id, email: authUser.email, role: authUser.role };

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
            auth: authUser,
            accessToken,
            refreshToken,
            expiresAt,
            });

            return {
            user: {
                id: authUser.id,
                email: authUser.email,
                role: authUser.role,
            },
            accessToken,
            refreshToken,
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }


    // logout user
    async logout(accessToken: string){
        return this.sessionService.deleteSessionByToken(accessToken);
    }

    // forgot password
    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
      try{
        const user = await this.authRepository.findOne({
            where: {email: forgotPasswordDto.email}
        })
        if (!user) {
          throw new NotFoundException('Email does not exist');
        }
        const resetToken = Math.random().toString(36).slice(2, 14);  
        user.resetPasswordToken = resetToken;
        const expires = new Date();
        expires.setMinutes(expires.getMinutes() + 5);
        user.expiresAt = expires;

        await this.authRepository.save(user);
        await this.emailService.sendResetPasswordEmail(user.email, resetToken);
        return {
          message: `Password reset token generated. Token is: ${resetToken}`,
          expiresInMinutes: 5
        };
      } catch(error){
          throw new NotFoundException(error.message);
      }
    }

    // validtion for forgot password access token
    async validateResetToken(validatateTokenDto: ValidatateTokenDto) {
        try{
            const user = await this.authRepository.findOne({
                where: {email: validatateTokenDto.email}
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
        }catch(error){
            throw new BadRequestException(error.message);
        }
    }

    // reset password        
    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        try {
            const user = await this.authRepository.findOne({
                where: {email: resetPasswordDto.email}
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

    // remove auth entry of user
    async removeAuth(authId: number): Promise<{ message: string }> {
        try {
            const auth = await this.authRepository.findOne({
                where: { id: authId },
                relations: ['sessions'],
            });
            console.log('auth id is: ',authId);
            if (!auth) {
                throw new NotFoundException('Auth record not found');
            }
            if (auth.sessions && auth.sessions.length > 0) {
                await this.sessionService.deleteSessionByUserId(auth.id);
            }

            // Soft-delete the auth record
            await this.authRepository.softRemove(auth);

            return { message: 'account deleted' };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }




}

