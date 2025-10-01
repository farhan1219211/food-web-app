import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
// import { AddToCartDto } from './dto/add-to-cart.dto';
// import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(@InjectRepository(Cart) private readonly cartRepository: Repository<Cart>){}

  async create(customerId: number) {
    try {
      const cart = this.cartRepository.create({
        user: { id: customerId },
      });
      
      return await this.cartRepository.save(cart); 
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // async findOne(customerId: number): Promise<boolean> {
  //   try{
  //       const cart = await this.cartRepository.findOne({
  //         where: {user: {id: customerId}}
  //       });
  //       if(!cart){
  //         return false;
  //       }
  //       return true;
  //   }catch(error){
  //     throw new NotFoundException(error.message);
  //   }
  // }
  

  // find dish from the menu
  async findOne(customerId: number): Promise<Cart | null> {
    try {
      return await this.cartRepository.findOne({
        where: { user: { id: customerId } },
        relations: ['cartItems', 'cartItems.menu'],
      });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  // remove the whole cart
  async remove(customerId: number) {
    try {
      const result = await this.cartRepository.delete({ user: { id: customerId } });

      if (result.affected === 0) {
        throw new NotFoundException('Cart not found for this user');
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // View the cart
  async viewCart(customerId: number) {
    try {
      const cart = await this.cartRepository.findOne({
        where: { user: { id: customerId } },
        relations: ['cartItems', 'cartItems.menu'], 
      });

      if (!cart || cart.cartItems.length === 0) {
        throw new NotFoundException('Cart is empty');
      }

      return cart;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

}
