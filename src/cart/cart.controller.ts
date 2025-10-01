import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Guard } from 'src/common/guard/guard.guard';
import { Roles } from 'src/common/guard/role/role.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Role } from 'src/common/enum/role.enum';

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

}
