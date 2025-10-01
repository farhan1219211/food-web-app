import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FavouriteService } from './favourite.service';
import { CreateFavouriteDto } from './dto/create-favourite.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Guard } from 'src/common/guard/guard.guard';
import { Roles } from 'src/common/guard/role/role.decorator';
import { Role } from 'src/common/enum/role.enum';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('favourite')
export class FavouriteController {
  constructor(private readonly favouriteService: FavouriteService) {}

  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.CUSTOMER)
  @ApiOperation({summary: 'Add Dish to your favourite list, So you can order more quickly (add any item from menu of restaurants)'})
  @Post('add-to-favorutie')
  create(@GetUser('id') customerId: number,@Body() createFavouriteDto: CreateFavouriteDto) {
    return this.favouriteService.create(customerId, createFavouriteDto);
  }


  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.CUSTOMER)
  @ApiOperation({summary: 'Get list of your favourite dishes'})
  @Get('list')
  findAll(@GetUser('id') customerId: number) {
    return this.favouriteService.findFavouriteList(customerId);
  }


  // remove from favourite list
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Remove dish from favourite', description: 'Enter id of dish you want to remove' })
  @Delete('remove/:id')
  remove(@Param('id') id: number, @GetUser('id') customerId: number,  
  ) {
     return this.favouriteService.remove(customerId, id);
  }

  // empty your favourite list
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Remove all dishes from favourite list' })
  @Delete('remove-all')
  removeAll(@GetUser('id') customerId: number) {
    return this.favouriteService.removeAll(customerId);
  }


}
