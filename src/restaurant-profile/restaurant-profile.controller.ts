import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { RestaurantProfileService } from './restaurant-profile.service';
import { UpdateRestaurantProfileDto } from './dto/update-restaurant-profile.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Guard } from 'src/common/guard/guard.guard';
import { Roles } from 'src/common/guard/role/role.decorator';
import { Role } from 'src/common/enum/role.enum';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { RestaurantPaginationDto } from './dto/pagination-search.dto';


@ApiTags('Restaurant Profile')
@Controller('restaurant-profile')
export class RestaurantProfileController {
  constructor(private readonly restaurantProfileService: RestaurantProfileService) {}

    
  // @ApiBearerAuth()
  // @UseGuards(Guard)
  // @Roles(Role.SUPER_ADMIN)
  // @Post('create-restaurant-profile')
  // @ApiOperation({ summary: 'Create a new restaurant profile (Super Admin only)' })
  // create(@Body() dto: CreateRestaurantProfileDto) {
  //   return this.restaurantProfileService.create(dto);
  // }

  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.RESTAURANT_ADMIN)
  @Patch('update-restaurant-profile')
  @ApiOperation({ summary: 'Update the restaurant profile (only restaurant admin)' })
  async updateRestaurantProfile(@GetUser('id') adminId: number, @Body() updateRestaurantProfileDto: UpdateRestaurantProfileDto,
  ) {
    return this.restaurantProfileService.update(adminId, updateRestaurantProfileDto);
  }


  @Get()
  @ApiOperation({ summary: 'Get all restaurant with pagination & search' })
  findAll(@Query() query: RestaurantPaginationDto) {
    return this.restaurantProfileService.findAll(query);
  }

  // fetch restaurant profile
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.RESTAURANT_ADMIN)
  @Get('me')
  @ApiOperation({ summary: 'Get the logged-in restaurant admin profile' })
  async getMyRestaurantProfile(@GetUser('id') adminId: number) {
    return this.restaurantProfileService.findByAdmin(adminId);
  }

  // soft delete restaurant profile
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a restaurant profile (only super admin)' })
  async softDeleteRestaurantProfile(@Param('id') id: number) {
    return this.restaurantProfileService.softDelete(id);
  }

}
