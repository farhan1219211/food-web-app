import { Module } from '@nestjs/common';
import { CartDishesService } from './cart-dishes.service';
import { CartDishesController } from './cart-dishes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartDish } from './entities/cart-dish.entity';
import { SessionModule } from 'src/session/session.module';
import { UserModule } from 'src/user/user.module';
import { CartModule } from 'src/cart/cart.module';
import { MenuModule } from 'src/menu/menu.module';

@Module({
  imports: [TypeOrmModule.forFeature([CartDish]),
    SessionModule, 
    UserModule,
    CartModule,
    MenuModule],
  controllers: [CartDishesController],
  providers: [CartDishesService],
})
export class CartDishesModule {}
