import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Guard } from 'src/common/guard/guard.guard';
import { Roles } from 'src/common/guard/role/role.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Role } from 'src/common/enum/role.enum';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDishDto } from './dto/update-cart-dish.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // view the cart
  @Get('view-cart')
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.CUSTOMER)
  @ApiOperation({summary: "View the dishes you places inside your cart"})
  viewCart(@GetUser('id') customerId: number){
    return this.cartService.viewCart(customerId);
  }

  // delete the whole cart
  @Delete('remove-cart')
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.CUSTOMER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove entire cart for the logged-in customer' })
  removeCart(@GetUser('id') customerId: number) {
    return this.cartService.remove(customerId);
  }

    // add to cart
    @ApiBearerAuth()
    @UseGuards(Guard)
    @Roles(Role.CUSTOMER)
    @ApiOperation({ summary: 'Expects an id of dish as well as quantity for that dish to order' })
    @Post('add-to-cart')
    create(@GetUser('id') customerId: number, @Body() addToCart: AddToCartDto) {
      return this.cartService.addToCart(customerId, addToCart);
    }
  
    // update the quantity inside the cart
    @Patch('cart/:dishId')
    @ApiBearerAuth()
    @UseGuards(Guard)
    @Roles(Role.CUSTOMER)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Update the quantity of a dish in the cart' })
    async updateCartDish(@GetUser('id') customerId: number, @Param('dishId') dishId: number, @Body() updateDto: UpdateCartDishDto) {
      await this.cartService.updateCartDish(customerId, +dishId, updateDto);
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
      await this.cartService.removeDish(customerId, +dishId);
    }

}
