import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrderDishes } from './entities/order-dishes.entity';
import { CartService } from 'src/cart/cart.service';
import { OrderStatus } from './enum/order-status.enum';
import { Role } from 'src/common/enum/role.enum';
import { EmailService } from 'src/email/email.service';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { isEmail } from 'class-validator';

@Injectable()
export class OrderService {

  constructor(@InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderDishes) private readonly orderDishesRepository: Repository<OrderDishes>,
    private readonly cartService: CartService,
    private readonly emailService: EmailService
    ){}
  
  async placeOrder(customer: any, createOrderDto: CreateOrderDto) {
    try{
      const customerEmail = customer.email;
    const cart = await this.cartService.findOne(customer.id);
    if(!cart){
      throw new BadRequestException(`You cannot place an order because your cart is empty`)
    }
    // if restaurant is soft delete
    const restaurant = cart.cartItems[0].menu.restaurant;
    if(!restaurant){
      throw new BadRequestException(`Restaurant is currentlly unavailable`);
    }
    dayjs.extend(customParseFormat);
    console.log(restaurant.openingTime);
    console.log(restaurant.closingTime);

  if (restaurant.openingTime && restaurant.closingTime) {
    const now = dayjs();
    console.log("now: ", now.format("HH:mm:ss"));

    const opening = dayjs(restaurant.openingTime, "HH:mm:ss");
    const closing = dayjs(restaurant.closingTime, "HH:mm:ss");

    console.log("opening: ", opening.format("HH:mm:ss"));
    console.log("closing: ", closing.format("HH:mm:ss"));

    if (now.isBefore(opening) || now.isAfter(closing)) {
        throw new BadRequestException(
          `${restaurant.businessName} is closed right now. Please order between ${restaurant.openingTime} and ${restaurant.closingTime}.`,
        );
      }
    }
    console.log(restaurant);
    if(!restaurant.isOpen){
      throw new BadRequestException(`Restaurant is not serving temperoray`);
    }

    const order = Order.from(createOrderDto, customer.id);
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
    const savedOrder = await this.orderRepository.save(order);

    // clear cart
     await this.cartService.remove(customer.id);

    // fetch  restaurant admin emails
    const restaurantAdminEmail = cart.cartItems[0].menu.restaurant.email;

    
    console.log("restaurant email is: ", restaurantAdminEmail);
    // send confirmation emails
    await this.emailService.sendOrderConfirmationToCustomer(customerEmail, savedOrder);
    if(isEmail(restaurantAdminEmail) && restaurantAdminEmail){
        await this.emailService.sendOrderNotificationToRestaurant(
          restaurantAdminEmail,
          savedOrder,
          customerEmail,
        );
    }
    return savedOrder;
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
        // relations: ['dishes', 'dishes.dish'],
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
  // async updateStatus(user: any, orderId: number, dto: UpdateOrderStatusDto) {
  //   try {
  //     const order = await this.orderRepository.findOne({
  //       where: { id: orderId },
  //       relations: ['dishes', 'dishes.dish', 'dishes.dish.restaurant'], 
  //     });
  //     console.log("value of order is: ", order);

  //     if (!order) {
  //       throw new NotFoundException(`Order with ID ${orderId} not found`);
  //     }

  //     if (user.role === Role.SUPER_ADMIN) {
  //       order.status = dto.status;
  //       const updated = await this.orderRepository.save(order);
  //       return { message: `Order is now ${dto.status}`};
  //     }

  //   } catch (error) {
  //     throw new BadRequestException(`Failed to update order status: ${error.message}`);
  //   }
  // }

  async updateStatus(user: any, orderId: number, dto: UpdateOrderStatusDto) {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['dishes', 'dishes.dish', 'dishes.dish.restaurant', 'dishes.dish.restaurant.restaurantAdmin'],
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }
      console.log(order);

      // Super Admin can always update
      if (user.role === Role.SUPER_ADMIN) {
        order.status = dto.status;
        await this.orderRepository.save(order);
        return { message: `Order status updated to ${dto.status}` };
      }

      // Restaurant Admin: check ownership
      if (user.role === Role.RESTAURANT_ADMIN) {
        const restaurantAdminId = order.dishes[0].dish.restaurant.restaurantAdmin?.id;
        console.log("restaurant admin id is: ", restaurantAdminId);
        if (!restaurantAdminId || restaurantAdminId !== user.id) {
          throw new ForbiddenException(
            'You are not authorized to update status of this order',
          );
        }

        order.status = dto.status;
        await this.orderRepository.save(order);
        return { message: `Order status updated to ${dto.status}` };
      }
      throw new ForbiddenException('You are not allowed to update orders');
    } catch (error) {
      throw new BadRequestException(
        `Failed to update order status: ${error.message}`,
      );
    }
  }


  //  order for review section
  async findOrderToReview(customerId: number, dishId: number, orderId: number) {
    try {
      const order = await this.orderRepository.findOne({
        where: {
          id: orderId,
          customer: {id: customerId},
          dishes: {
            dish: {id: dishId}
          },
        },
        relations: ['dishes', 'dishes.dish'],
      });
      if (!order) {
        throw new BadRequestException('Order not found');
      }
      console.log("order is: ", order);
      return order;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  // restaurant fetch all orders they received
  async findAllForRestaurantAdmin(adminId: number,page = 1,limit = 10,status?: OrderStatus) {
    try {
      const query = this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.dishes', 'orderDishes')
        .leftJoinAndSelect('orderDishes.dish', 'dish')
        .leftJoinAndSelect('dish.restaurant', 'restaurant')
        .leftJoinAndSelect('restaurant.restaurantAdmin', 'restaurantAdmin')
        .where('restaurantAdmin.id = :adminId', { adminId });

      if (status) {
        query.andWhere('order.status = :status', { status });
      }

      query
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('order.createdAt', 'DESC');

      const [orders, total] = await query.getManyAndCount();

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
          message: 'No orders found for this restaurant',
        };
      }
      console.log(orders);

      return {
        data: orders.map(order => ({
          id: order.id,
          // customerId: order.customer.id,
          totalPrice: order.totalPrice,
          status: order.status,
          shippingAddress: order.shippingAddress,
          phoneNumber: order.phoneNumber,
          createdAt: order.createdAt,
          dishes: order.dishes.map(d => ({
            id: d.dish.id,
            name: d.dish.name,
            price: d.dish.price,
            quantity: d.quantity,
            imageUrl: d.dish.imageUrl,
          })),
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          status: status ?? 'ALL',
        },
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch restaurant orders: ${error.message}`,
      );
    }
  }


  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
