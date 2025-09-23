import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, BadRequestException, Query, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { Guard } from 'src/auth/guard/guard.guard';
import { Roles } from 'src/auth/guard/role/role.decorator';
import { Role } from 'src/common/enum/role.enum';
import { PaginationDto } from './dto/paginatioin.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';


@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //add restaurant
  @UseGuards(Guard)
  @Roles(Role.SUPER_ADMIN)
  @Post('add-restaurant')
  @ApiOperation({ summary: 'Create restaurant admin (only super admin)' })
  async createRestaurantAdmin(@Body() createUserDto: CreateUserDto, @GetUser('email') email:string) {
    // return this.userService.createRestaurantAdmin(createUserDto, email);
  }


 // Create user
  @Post('signup')
  @ApiOperation({ summary: 'Create a new user account (super admin and customer)' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try{
      if(createUserDto.role === 'restaurant_admin'){
          throw new BadRequestException('Only super admin have permission to create a restaurant account')
        }
      return this.userService.createUser(createUserDto);
    }catch(error){
      throw new BadRequestException(error.message);
    }
  }

  // update the profile of the user
  @Patch('update-information')
  @UseGuards(Guard)
  @ApiOperation({ summary: 'User update current user profile (fullName, phone, and address)' })
  async updateMe(@GetUser('sub') authId: number, @Body() updateUserDto: UpdateUserDto){
    try {
      return await this.userService.updateCustomer(authId, updateUserDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // // Get all users
  // @UseGuards(Guard)
  // @Roles(Role.SUPER_ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all users with pagination, (Super Admin)' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.userService.findAll(paginationDto);
  }


  @UseGuards(Guard)
  @Roles(Role.CUSTOMER, Role.RESTAURANT_ADMIN, Role.SUPER_ADMIN)
  @Get('profile')
  @ApiOperation({ summary: 'Get current logged-in user profile' })
  findOne(@GetUser('sub') authId: number): Promise<UserResponseDto> {
    return this.userService.findOne(authId);
  }

  // self delete account
  @UseGuards(Guard)
  @Roles(Role.SUPER_ADMIN, Role.CUSTOMER, Role.RESTAURANT_ADMIN)
  @Delete('delete-account')
  @ApiOperation({ summary: 'Delete current logged-in user account' })
  remove(@GetUser('sub') authId: number) {
    return this.userService.remove(authId);
  }

  @UseGuards(Guard)
  @Roles(Role.SUPER_ADMIN)
  @Patch('disable/:userId')
  @ApiOperation({ summary: 'Disable a user account (only Super Admin)' })
  @ApiParam({ name: 'userId', description: 'ID of the user to disable', example: 15 })
  @ApiResponse({ status: 200, description: 'User disabled successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async disableUser(@Param('userId') userId: number) {
    return this.userService.remove(userId);
  }



}
