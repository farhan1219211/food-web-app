import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { SessionModule } from 'src/session/session.module';
import { UserModule } from 'src/user/user.module';
import { CartDish } from './entities/cart-dish.entity';
import { MenuModule } from 'src/menu/menu.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartDish]),
  SessionModule,
  UserModule,
  MenuModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService]
})
export class CartModule {}
