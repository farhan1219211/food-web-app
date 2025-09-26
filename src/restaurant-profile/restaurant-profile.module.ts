import { Module } from '@nestjs/common';
import { RestaurantProfileService } from './restaurant-profile.service';
import { RestaurantProfileController } from './restaurant-profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantProfile } from './entities/restaurant-profile.entity';
import { SessionModule } from 'src/session/session.module';
import { UserModule } from 'src/user/user.module';
import { CuisineModule } from 'src/cuisine/cuisine.module';
@Module({
  imports:[TypeOrmModule.forFeature([RestaurantProfile]),
  SessionModule,
  UserModule,
  CuisineModule],
  controllers: [RestaurantProfileController],
  providers: [RestaurantProfileService],
  exports: [RestaurantProfileService]
})
export class RestaurantProfileModule {}
