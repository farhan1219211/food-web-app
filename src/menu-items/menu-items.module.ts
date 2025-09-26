import { Module } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsController } from './menu-items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { UserModule } from 'src/user/user.module';
import { SessionModule } from 'src/session/session.module';
import { RestaurantProfileModule } from 'src/restaurant-profile/restaurant-profile.module';
import { CuisineModule } from 'src/cuisine/cuisine.module';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItem]),
    UserModule,
    SessionModule,
    RestaurantProfileModule,
    CuisineModule],
  controllers: [MenuItemsController],
  providers: [MenuItemsService],
})
export class MenuItemsModule {}
