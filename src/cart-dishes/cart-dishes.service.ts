import { BadRequestException, Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDishDto } from './dto/update-cart-dish.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from 'src/common/enum/role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { CartDish } from './entities/cart-dish.entity';
import { Repository } from 'typeorm';

import { CartService } from 'src/cart/cart.service';
import { MenuService } from 'src/menu/menu.service';

@Injectable()
export class CartDishesService {
  constructor(@InjectRepository(CartDish) private readonly cartDishRepository: Repository<CartDish>,
  private readonly cartService: CartService,
  private readonly menuService: MenuService){}

  // add dish to the cart
  async addToCart(customerId: number, addToCart: AddToCartDto) {
    try {
      // check either cart exist or not
      let cart = await this.cartService.findOne(customerId);

      if (!cart) {
        cart = await this.cartService.create(customerId);
      }

      //  check if dish exists or not
      const dish = await this.menuService.getDish(addToCart.dishId);
      if (!dish.isAvailable) {
        throw new BadRequestException(`Dish ${dish.name} currently unavailable`);
      }

      // current dishes inside the cart
      const currentDishes: number[] = cart.cartItems.map(item => item.dishId);
      if (currentDishes.includes(addToCart.dishId)) {
        throw new BadRequestException(`${dish.name} is already in cart`);
      }
      const newCartDish = this.cartDishRepository.create({
        cart,
        menu: dish,
        quantity: addToCart.quantity,
        price: dish.price * addToCart.quantity,
      });

      const savedCartDish = await this.cartDishRepository.save(newCartDish);
      return {
        message: `${dish.name} added to cart`,
        data: savedCartDish,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  
  // update the cart
  async updateCartDish(customerId: number,dishId: number,updateDto: UpdateCartDishDto,)
  {
    try {
      const cart = await this.cartService.findOne(customerId);

      const cartDish = cart?.cartItems.find(item => item.dishId === dishId);
      if (!cartDish) {
        throw new NotFoundException(`Dish with id ${dishId} not found in cart`);
      }
      cartDish.quantity = updateDto.quantity;
      cartDish.price = cartDish.menu.price * updateDto.quantity;
      await this.cartDishRepository.save(cartDish);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // remove dish from the cart
  async remove(customerId: number, dishId: number) {
    try {
      const cart = await this.cartService.findOne(customerId);
      if (!cart) {
        throw new NotFoundException('Cart not found for this user');
      }
      const cartDish = cart.cartItems.find(item => item.dishId === dishId);
      if (!cartDish) {
        throw new NotFoundException(`Dish with id ${dishId} not found in cart`);
      }
      await this.cartDishRepository.remove(cartDish);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

}
