import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Guard } from 'src/common/guard/guard.guard';
import { Roles } from 'src/common/guard/role/role.decorator';
import { Role } from 'src/common/enum/role.enum';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { RestaurantPaginationDto } from './dto/pagination-search.dto';


@ApiTags('Restaurant Profile')
@Controller('restaurant-profile')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.RESTAURANT_ADMIN)
  @Patch('update-restaurant-profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update the restaurant profile (only restaurant admin)' })
  async updateRestaurant(@GetUser('id') adminId: number, @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    return this.restaurantService.update(adminId, updateRestaurantDto);
  }

  @ApiBearerAuth()
  @UseGuards(Guard)
  @Get()
  @ApiOperation({ summary: 'Get all restaurant with pagination & search' })
  findAll(@Query() query: RestaurantPaginationDto) {
    return this.restaurantService.findAll(query);
  }

  // fetch restaurant profile
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.RESTAURANT_ADMIN)
  @Get('me')
  @ApiOperation({ summary: 'Get the logged-in restaurant admin profile' })
  async getMyRestaurant(@GetUser('id') adminId: number) {
    return this.restaurantService.findByAdmin(adminId);
  }

  // soft delete restaurant profile
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a restaurant profile (only super admin)' })
  async softDeleteRestaurant(@Param('id') id: number) {
    return this.restaurantService.softDelete(id);
  }

}
