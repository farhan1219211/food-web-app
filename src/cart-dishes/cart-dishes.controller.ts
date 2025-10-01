import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CartDishesService } from './cart-dishes.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDishDto } from './dto/update-cart-dish.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from 'src/common/enum/role.enum';
import { Guard } from 'src/common/guard/guard.guard';
import { Roles } from 'src/common/guard/role/role.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('cart-dishes')
export class CartDishesController {
  constructor(private readonly cartDishesService: CartDishesService) {}

  // add to cart
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Expects an id of dish as well as quantity for that dish to order' })
  @Post('add-to-cart')
  create(@GetUser('id') customerId: number, @Body() addToCart: AddToCartDto) {
    return this.cartDishesService.addToCart(customerId, addToCart);
  }

  // update the quantity inside the cart
  @Patch('cart/:dishId')
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.CUSTOMER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update the quantity of a dish in the cart' })
  async updateCartDish(@GetUser('id') customerId: number, @Param('dishId') dishId: number, @Body() updateDto: UpdateCartDishDto) {
    await this.cartDishesService.updateCartDish(customerId, +dishId, updateDto);
  }

  // remove dish from the cart
  @Delete('cart/dish/:dishId')
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.CUSTOMER)
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a specific dish from the cart' })
  async removeCartDish(@GetUser('id') customerId: number, @Param('dishId') dishId: number,
  ) {
    await this.cartDishesService.remove(customerId, +dishId);
  }

}
