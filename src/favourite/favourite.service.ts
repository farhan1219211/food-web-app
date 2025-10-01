import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFavouriteDto } from './dto/create-favourite.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Favourite } from './entities/favourite.entity';
import { Repository } from 'typeorm';
import { MenuService } from 'src/menu/menu.service';
import { User } from 'src/user/entities/user.entity';
import { Menu } from 'src/menu/entities/menu.entity';
import { plainToInstance } from 'class-transformer';
import { PublicFavouriteDto } from './dto/favourite-response.dto';

@Injectable()
export class FavouriteService {
  constructor(@InjectRepository(Favourite) private readonly favouriteRepository: Repository<Favourite>,
          private readonly menuService: MenuService){}

  async create(customerId: number, createFavouriteDto: CreateFavouriteDto) {
    try{
      const dish = await this.menuService.getDish(createFavouriteDto.id);
      console.log("value of dish is: ", dish);
      if(!dish.isAvailable){
        throw new BadRequestException(`Currently Dish is not available`)
      }
      const favoruite = new Favourite();
      favoruite.user = {id: customerId} as User;
      favoruite.menu = {id: dish.id } as Menu;
      console.log("value of favourite is: ", favoruite);
      return await this.favouriteRepository.save(favoruite);
  }catch(error){
    if (error.code === '23505') {
      throw new BadRequestException(`This dish is already in your favourites`);
    }
    throw new BadRequestException(error.message);
  }

  }

  // get your favourite list
  async findFavouriteList(customerId: number) {
    try {
      const favourites = await this.favouriteRepository.find({
        where: { user: { id: customerId } }, 
        relations: ['menu', 'menu.restaurant'],
      });

      return plainToInstance(PublicFavouriteDto, favourites, {
        excludeExtraneousValues: true
      }); 
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // remove dish from favouriite
  async remove(customerId: number, favouriteId: number) {
    try {
      const result = await this.favouriteRepository.delete({
        id: favouriteId,
        user: {id: customerId},
      });

      if (result.affected === 0) {
        throw new NotFoundException(
          `Favourite with ID ${favouriteId} not found `,
        );
      }

      return { message: 'Favourite removed successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // remove all favourites of a customer
  async removeAll(customerId: number) {
    try {
      const result = await this.favouriteRepository.delete({
        user: { id: customerId },
      });

      if (result.affected === 0) {
        throw new NotFoundException(
          `No favourites found for this customer`,
        );
      }
      return { message: 'All favourites removed successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }



}
