import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderDishes } from './entities/order-dishes.entity';
import { SessionModule } from 'src/session/session.module';
import { UserModule } from 'src/user/user.module';
import { CartModule } from 'src/cart/cart.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderDishes]),
  SessionModule, 
  UserModule,
  CartModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
