import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from './dto/paginatioin.dto';
import { Auth } from 'src/auth/entity/auth.entity';
import { SessionService } from 'src/session/session.service';
import { toUserResponse, UserResponse } from 'src/common/utils/user.mapper';
import { Role } from 'src/common/enum/role.enum';
import { not } from 'rxjs/internal/util/not';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        private readonly sessionService: SessionService,
    ) {}

    // create user profile called by auth service
    async createUserProfile(createUserDto: CreateUserDto, auth: Auth, role: Role): Promise<User> {
        try {
            const newUser: User = this.userRepository.create({
                ...createUserDto,
                role,
                auth,
            });
            if (!newUser) {
                throw new BadRequestException(`Failed to create user account`);
            }
            return this.userRepository.save(newUser);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // update the user
    // async updateCustomer(userId: number, updateUserDto: UpdateUserDto): Promise<UserResponse> {
    //     try {
    //         const user = await this.userRepository.findOne({
    //             where: { id: userId },
    //         });

    //         if (!user) {
    //             throw new NotFoundException('User not found');
    //         }

    //         // Only fullName, phone and address will be updated
    //         Object.assign(user, updateUserDto);

    //         const updatedUser = await this.userRepository.save(user);

    //         return toUserResponse(user);
    //     } catch (error) {
    //         throw new NotFoundException(error.message);
    //     }
    // }

    async updateCustomer(userId: number, updateUserDto: UpdateUserDto){
        try{
            const result = await this.userRepository.update({
                id: userId
            },
            updateUserDto
            );
            if(result.affected === 0){
                throw new NotFoundException(`User with ID ${userId} not found`);
            }
            return {message: 'User updated successfully'}
        }catch(error){
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
                query.andWhere('user.role = :role', { role });
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
                data: users.map((user) =>
                    toUserResponse(user),
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
    async findOne(userId: number): Promise<User> {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['auth'],
            });

            if (!user) {
                throw new NotFoundException('User not found');
            }
            return user;
        } catch (error) {
            throw new NotFoundException(error.message || 'Failed to fetch profile');
        }
    }

    // remove auth entry of user
    async remove(userId: number) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                // relations: ['sessions']
            });
            if (!user) {
                throw new NotFoundException('User record not found');
            }
            // user will be log out from all devices
            await this.sessionService.deleteSessionByUserId(user.id);
            // soft del user
            await this.userRepository.softRemove(user);

            return { message: 'deletion successfull' };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
