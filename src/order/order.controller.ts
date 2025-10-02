import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {  UpdateOrderStatusDto } from './dto/update-order.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Guard } from 'src/common/guard/guard.guard';
import { Roles } from 'src/common/guard/role/role.decorator';
import { Role } from 'src/common/enum/role.enum';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { OrdersPaginatedResponseDto } from './dto/order-paginated-response.dto';
import { OrderStatus } from './enum/order-status.enum';
import { OrderFilterDto } from './dto/order-filter.dto';
import { GetRestaurantOrdersDto } from './dto/restaurant-orders.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}


  // place order
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer create new order'})
  @UseGuards(Guard)
  @Roles(Role.CUSTOMER)
  @Post('customer/place-order')
  async placeOrder(@GetUser() customer: any, @Body() createOrderDto: CreateOrderDto) {
      return this.orderService.placeOrder(customer, createOrderDto);
  }


  @Get('get-all-orders')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer fetches all of his orders'})
  @UseGuards(Guard)
  @ApiOperation({ summary: 'Get all orders of a user with pagination and optional status filter' })
  @ApiResponse({ status: 200, type: OrdersPaginatedResponseDto })
  async findAll(@GetUser('id') customerId: number, @Query() filter: OrderFilterDto) {
    return this.orderService.findAll(customerId, filter.page, filter.limit, filter.status);
  }



  @Get('order/:id')
  @ApiBearerAuth()
  @UseGuards(Guard)
  @ApiOperation({ summary: 'Get details of a single order' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  async findOne(@GetUser('id') customerId: number, @Param('id') id: number) {
    return this.orderService.findOne(customerId, Number(id));
  }
  
  // update the status of an order
  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_ADMIN)
  @ApiOperation({ summary: 'Update the status of an order (restricted to restaurant owners and super admins)' })
  @ApiParam({ name: 'id', type: Number, description: 'Order ID' })
  @ApiBody({ type: UpdateOrderStatusDto})
  async updateStatus(@GetUser() user: any, @Param('id') id: number, @Body() dto: UpdateOrderStatusDto) {
    return this.orderService.updateStatus(user, Number(id), dto);
  }

  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.RESTAURANT_ADMIN)
  @Get('restaurant-orders')
  @ApiOperation({ summary: 'Get all orders received by restaurant admin' })
  findAllForRestaurantAdmin( @GetUser('id') adminId: number, @Query() query: GetRestaurantOrdersDto,
  ) 
  {
    return this.orderService.findAllForRestaurantAdmin( adminId, query.page, query.limit, query.status,);
  }


  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.orderService.remove(+id);
  // }
}
