import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { SessionModule } from 'src/session/session.module';
import { UserModule } from 'src/user/user.module';
import { CuisineModule } from 'src/cuisine/cuisine.module';
@Module({
  imports:[TypeOrmModule.forFeature([Restaurant]),
  SessionModule,
  UserModule,
  CuisineModule],
  controllers: [RestaurantController],
  providers: [RestaurantService],
  exports: [RestaurantService]
})
export class RestaurantModule {}
