import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { UserModule } from 'src/user/user.module';
import { SessionModule } from 'src/session/session.module';
import { MenuModule } from 'src/menu/menu.module';
import { OrderModule } from 'src/order/order.module';

@Module({

  imports: [TypeOrmModule.forFeature([Review]),
  UserModule, SessionModule, MenuModule, OrderModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
