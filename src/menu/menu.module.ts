import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { UserModule } from 'src/user/user.module';
import { SessionModule } from 'src/session/session.module';
import { RestaurantModule } from 'src/restaurant/restaurant.module';
import { CuisineModule } from 'src/cuisine/cuisine.module';

@Module({
  imports: [TypeOrmModule.forFeature([Menu]),
    UserModule,
    SessionModule,
    RestaurantModule,
    CuisineModule],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService]
})
export class MenuModule {}
