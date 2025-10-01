import { Module } from '@nestjs/common';
import { FavouriteService } from './favourite.service';
import { FavouriteController } from './favourite.controller';
import { SessionModule } from 'src/session/session.module';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favourite } from './entities/favourite.entity';
import { MenuModule } from 'src/menu/menu.module';

@Module({
  imports: [TypeOrmModule.forFeature([Favourite]),
      SessionModule, 
      UserModule, 
      MenuModule],
  controllers: [FavouriteController],
  providers: [FavouriteService],
})
export class FavouriteModule {}
