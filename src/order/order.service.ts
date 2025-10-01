import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import {  UpdateOrderStatusDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrderDishes } from './entities/order-dishes.entity';
import { CartService } from 'src/cart/cart.service';
import { OrderStatus } from './enum/order-status.enum';

@Injectable()
export class OrderService {

  constructor(@InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderDishes) private readonly orderDishesRepository: Repository<OrderDishes>,
    private readonly cartService: CartService
    ){}
  
  async placeOrder(customerId: number, createOrderDto: CreateOrderDto) {
    try{
    const cart = await this.cartService.findOne(customerId);
    if(!cart){
      throw new BadRequestException(`You cannot place an order because your cart is empty`)
    }
    const order = Order.from(createOrderDto, customerId);
    // map cart items with order dishes
    order.dishes = cart.cartItems.map((item) => {
      const orderDish = new OrderDishes();
      orderDish.dish = item.menu;
      orderDish.quantity = item.quantity;
      orderDish.price = item.menu.price;
      return orderDish; 
    });
    // calculation of total price of an order 
    order.calculateTotal();
    // delete the cart after successfull order placement
    await this.cartService.remove(customerId);
    return this.orderRepository.save(order);
    }catch(error){
      throw new BadRequestException(error.message);
    }
  }

  // customer fetch his all orders
  async findAll(customerId: number, page = 1, limit = 10, status?: OrderStatus) {
    try {
      const whereCondition: any = { customer: { id: customerId } };
      if (status) {
        whereCondition.status = status;
      }

      const [orders, total] = await this.orderRepository.findAndCount({
        where: whereCondition,
        relations: ['dishes', 'dishes.dish'],
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      if (!orders.length) {
        return {
          data: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
            status: status ?? 'ALL',
          },
          message: 'No orders found for this user',
        };
      }

      return {
        data: orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          status: status ?? 'ALL',
        },
        message: 'Orders fetched successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch orders: ${error.message}`);
    }
  }


  // find any specific order
  async findOne(customerId: number, id: number) {
    try {
      const order = await this.orderRepository.findOne({
        where: { id, customer: { id: customerId } },
        relations: ['dishes', 'dishes.dish'],
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found `);
      }
      return order;
    } catch (error) {
      throw new BadRequestException(`Failed to fetch order: ${error.message}`);
    }
  }

  // update the status of an order
  async updateStatus(user: any, orderId: number, dto: UpdateOrderStatusDto) {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['dishes', 'dishes.dish', 'dishes.dish.restaurant'], 
      });
      console.log("value of order is: ", order);

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      if (user.role === 'super_admin') {
        order.status = dto.status;
        const updated = await this.orderRepository.save(order);
        return { data: updated, message: 'Order status updated successfully by Super Admin' };
      }

      // Restaurant Owner: can update only if order belongs to their restaurant
      if (user.role === 'restaurant_owner') {
        const belongsToRestaurant = order.dishes.some(
          (od) => od.dish.restaurant.id === user.restaurantId,
        );
        console.log("belongs to restaurant is: ", belongsToRestaurant);

        if (!belongsToRestaurant) {
          throw new ForbiddenException(`You cannot update this order because it does not belong to your restaurant`);
        }

        order.status = dto.status;
        const updated = await this.orderRepository.save(order);
        return { data: updated, message: 'Order status updated successfully by Restaurant Owner' };
      }
      //  customers and other roles not allowed
      throw new ForbiddenException('You are not allowed to update the order status');
    } catch (error) {
      throw new BadRequestException(`Failed to update order status: ${error.message}`);
    }
  }



  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
