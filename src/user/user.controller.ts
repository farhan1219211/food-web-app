import {
    Controller,
    Get,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Guard } from 'src/common/guard/guard.guard';
import { Roles } from 'src/common/guard/role/role.decorator';
import { Role } from 'src/common/enum/role.enum';
import { PaginationDto } from './dto/paginatioin.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserResponse } from 'src/common/utils/user.mapper';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    // update the profile of the user
    @Patch('update-information')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(Guard)
    @ApiOperation({ summary: 'User update current user profile (fullName, phone, and address)' })
    async updateMe(@GetUser('id') userId: number, @Body() updateUserDto: UpdateUserDto,
    ){
        return this.userService.updateCustomer(userId, updateUserDto);
    }

    // Get all users
    @UseGuards(Guard)
    @Roles(Role.SUPER_ADMIN)
    @Get()
    @ApiOperation({ summary: 'Get all users with pagination, (Super Admin)' })
    async findAll(@Query() paginationDto: PaginationDto) {
        return this.userService.findAll(paginationDto);
    }

    @UseGuards(Guard)
    @Roles(Role.CUSTOMER, Role.RESTAURANT_ADMIN, Role.SUPER_ADMIN)
    @Get('profile')
    @ApiOperation({ summary: 'Get current logged-in user profile' })
    findOne(@GetUser('id') authId: number): Promise<UserResponse> {
        return this.userService.findOne(authId);
    }

    // self delete account
    @UseGuards(Guard)
    @Roles(Role.SUPER_ADMIN, Role.CUSTOMER, Role.RESTAURANT_ADMIN)
    @Delete('delete-account')
    @ApiOperation({ summary: 'Delete current logged-in user account' })
    remove(@GetUser('id') userId: number) {
        return this.userService.remove(userId);
    }

    @UseGuards(Guard)
    @Roles(Role.SUPER_ADMIN)
    @Patch('disable/:userId')
    @ApiOperation({ summary: 'Disable a user account (only Super Admin)' })
    @ApiParam({ name: 'userId', description: 'ID of the user to disable', example: 15 })
    async disableUser(@Param('userId') userId: number) {
        return this.userService.remove(userId);
    }
}
