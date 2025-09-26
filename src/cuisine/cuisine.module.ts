import { Module } from '@nestjs/common';
import { CuisineService } from './cuisine.service';
import { CuisineController } from './cuisine.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionModule } from 'src/session/session.module';
import { UserModule } from 'src/user/user.module';
import { Cuisine } from './entities/cuisine.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cuisine]),
          SessionModule, UserModule],
  controllers: [CuisineController],
  providers: [CuisineService],
  exports: [CuisineService]
})
export class CuisineModule {}
