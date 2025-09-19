import {  BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginationDto } from './dto/paginatioin.dto';
import { Role } from 'src/common/enum/role.enum';
import { EmailService } from 'src/email/email.service';


@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>,
      private readonly authService: AuthService,
      private readonly emailService: EmailService
  ){}
      // create new user
  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const authUser = await this.authService.createAuthUser({
        email: createUserDto.email,
        password: createUserDto.password,
        role: createUserDto.role
      });

      // create User profile and link it with auth
      const newUser = new User();
      newUser.from(createUserDto);
      newUser.auth = authUser;

      const savedUser = await this.userRepository.save(newUser);

      return plainToInstance(UserResponseDto, savedUser, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  // create restaurant account
  async createRestaurantAdmin( createUserDto: CreateUserDto, superAdminEmail: string,): Promise<UserResponseDto> {
  try {
    if (createUserDto.role !== Role.RESTAURANT_ADMIN) {
      throw new BadRequestException('Role must be restaurant_admin');
    }

    const authUser = await this.authService.createAuthUser({
      email: createUserDto.email,
      password: createUserDto.password,
      role: Role.RESTAURANT_ADMIN,
    });

    const newUser = new User();
    newUser.from(createUserDto);
    newUser.auth = authUser;

    const savedUser = await this.userRepository.save(newUser);


    // Send email to restaurant_admin and all super admin
    await this.emailService.sendRestaurantAdminCreationEmail(
      savedUser.auth.email,
      createUserDto.password,
      superAdminEmail,
    );
    return plainToInstance(UserResponseDto, savedUser, {
      excludeExtraneousValues: true,
    });
  } catch (error) {
    throw new UnauthorizedException(error.message || 'Failed to create restaurant admin');
  }
}

  // update the user
  async updateCustomer(authId: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    try {
      const user = await this.userRepository.findOne({
        where: { auth: { id: authId } },
        relations: ['auth'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Only fullName, phone and address will be updated
      Object.assign(user, updateUserDto);

      const updatedUser = await this.userRepository.save(user);

      return plainToInstance(UserResponseDto, updatedUser, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  // get all users
  async findAll(paginationDto: PaginationDto) {
    try {
      const { page, limit, role, search } = paginationDto;

      const query = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.auth', 'auth')
        .orderBy('user.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      if (role) {
        query.andWhere('auth.role = :role', { role });
      }

      if (search) {
        query.andWhere(
          '(user.fullName ILIKE :search OR user.phone ILIKE :search OR user.address ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      const [users, total] = await query.getManyAndCount();

      if (users.length === 0) {
        throw new NotFoundException('No users found');
      }

      return {
        data: users.map(user =>
          plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }),
        ),
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new NotFoundException(error.message || 'Failed to fetch users');
    }
  }

  // get user profile
  async findOne(authId: number): Promise<UserResponseDto> {
      try {
        const user = await this.userRepository.findOne({
          where: { auth: { id: authId } },
          relations: ['auth'],
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        return plainToInstance(UserResponseDto, user, {
          excludeExtraneousValues: true,
        });
      } catch (error) {
        throw new NotFoundException(error.message || 'Failed to fetch profile');
      }
  }

  // remove auth entry of user
  async remove(authId: number): Promise<{ message: string }> {
      try {
          const user = await this.userRepository.findOne({
            where: { auth: { id: authId } },
            relations: ['auth'],
          });
          if (!user) {
              throw new NotFoundException('Auth record not found');
          }
          await this.authService.removeAuth(user.id);
          // Soft-delete the auth record
          console.log("value of user is: ", user);
          await this.userRepository.softRemove(user);

          return { message: 'deletion successfull' };
      } catch (error) {
          throw new BadRequestException(error.message );
      }
  }



}
