import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { CartDish } from './entities/cart-dish.entity';
import { MenuService } from 'src/menu/menu.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDishDto } from './dto/update-cart-dish.dto';
// import { AddToCartDto } from './dto/add-to-cart.dto';
// import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(@InjectRepository(Cart) private readonly cartRepository: Repository<Cart>, 
        @InjectRepository(CartDish) private readonly cartDishRepository: Repository<CartDish>,
        private readonly menuService: MenuService
        ){}

  async create(customerId: number) {
    try {
      const cart = this.cartRepository.create({
        user: { id: customerId },
        cartItems: []
      });
      
      return await this.cartRepository.save(cart); 
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // find dish from the menu
  async findOne(customerId: number): Promise<Cart | null> {
    try {
      return await this.cartRepository.findOne({
        where: { user: { id: customerId } },
        relations: ['cartItems', 'cartItems.menu', 'cartItems.menu.restaurant'], // restaurant because we have to send an email
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

  // add dish to the cart
  async addToCart(customerId: number, addToCart: AddToCartDto) {
    try {
      // check either cart exist or not
      let cart = await this.findOne(customerId);

      if (!cart) {
        cart = await this.create(customerId);
      }

      // check if dish exists or not
      const dish = await this.menuService.getDish(addToCart.dishId);
      if (!dish.isAvailable) {
        throw new BadRequestException(`Dish ${dish.name} is currently unavailable`);
      }

      // ensure only one restaurants dishes are in cart
      if (cart.cartItems.length > 0) {
        const existingRestaurantId = cart.cartItems[0].menu.restaurantId;
        if (dish.restaurantId !== existingRestaurantId) {
          throw new BadRequestException(
            'You can only add dishes from one restaurant to the cart. Please clear your cart before adding from another restaurant.',
          );
        }
      }

      // check duplicate dish
      const currentDishes: number[] = cart.cartItems.map((item) => item.dishId);
      if (currentDishes.includes(addToCart.dishId)) {
        throw new BadRequestException(`${dish.name} is already in your cart`);
      }

      // create new cart item
      const newCartDish = this.cartDishRepository.create({
        cart,
        menu: dish,
        dishId: dish.id,
        quantity: addToCart.quantity,
        price: dish.price * addToCart.quantity,
      });

      const savedCartDish = await this.cartDishRepository.save(newCartDish);

      return {
        message: `${dish.name} added to cart`,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // update the cart
  async updateCartDish(customerId: number,dishId: number,updateDto: UpdateCartDishDto)
  {
    try {
      const cart = await this.findOne(customerId);

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
  async removeDish(customerId: number, dishId: number) {
    try {
      const cart = await this.findOne(customerId);
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
