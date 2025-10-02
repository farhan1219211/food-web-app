import { BadRequestException, ConsoleLogger, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { RestaurantService } from 'src/restaurant/restaurant.service';
import { CuisineService } from 'src/cuisine/cuisine.service';
import { PublicMenuDto } from './dto/public-menu.dto';
import { plainToInstance } from 'class-transformer';
import { MenuPaginationDto } from './dto/menu-pagination.dto';
import { AdminMenuPaginationDto } from './dto/admin-menu-pagination.dto';
import { Role } from 'src/common/enum/role.enum';
import { zip } from 'rxjs';

@Injectable()
export class MenuService {
  constructor(@InjectRepository(Menu) private readonly menuRepository: Repository<Menu>,
      private readonly restaurantService: RestaurantService,
      private readonly cuisineService: CuisineService){}

  // create menu item for specific restaurant
  async create(resAdmin: User, createMenuDto: CreateMenuDto): Promise<PublicMenuDto>{
    try {
      // fetch profile of restaurant 
      const restaurant = await this.restaurantService.findByAdmin(resAdmin.id);
      if(!restaurant){
        throw new NotFoundException('Check you restaurant status')
      }
      // cuisine belongs to restaurant
      const allowedCuisineIds = restaurant.cuisines.map(c => c.id);
      if (!allowedCuisineIds.includes(createMenuDto.cuisineId)) {
        throw new BadRequestException(
          `This cuisine is not available for your restaurant. Please add it first.`,
        );
      }

      // fetch cuisine
      const cuisine = await this.cuisineService.findOne(createMenuDto.cuisineId);

      const menu = new Menu();
      menu.from(createMenuDto);
      menu.restaurant = restaurant;
      menu.cuisine = cuisine;
      console.log(menu);
      const saveMenu = await this.menuRepository.save(menu);
      return plainToInstance(PublicMenuDto, saveMenu, {
      excludeExtraneousValues: true,
    });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // get dish by id
  async getDish(id: number) {
    try {
      const dish = await this.menuRepository.findOne({
        where: {
          id,
          restaurant: { deletedAt: IsNull() },
        },
        relations: ['restaurant'],
      });
      if(!dish?.restaurant){
        throw new BadRequestException('Currently Unavailable')
      }
      if (!dish) {
        throw new NotFoundException(
          `Dish with ID ${id} not found `,
        );
      }

      return dish;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }


  // restaurant admin can fetch his all orders
  async findByAdmin(adminId: number, { page, limit }: AdminMenuPaginationDto ): Promise<{ data: PublicMenuDto[]; total: number; page: number; limit: number }> {
    try {
      const qb = this.menuRepository
        .createQueryBuilder('Menu')
        .leftJoinAndSelect('Menu.restaurant', 'restaurant')
        .leftJoinAndSelect('Menu.cuisine', 'cuisine')
        .where('restaurant.restaurantAdminId = :adminId', { adminId })
        .orderBy('Menu.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [items, total] = await qb.getManyAndCount();

      const data = items.map(item =>
        plainToInstance(PublicMenuDto, item, {
          excludeExtraneousValues: true,
        }),
      );

      return { data, total, page, limit };
    } catch (error) {
      throw new BadRequestException('Failed to fetch menu items: ' + error.message);
    }
  }

  // update the menu
  async update( resAdmin: User, menuId: number, updateMenuDto: UpdateMenuDto,): Promise<UpdateMenuDto> {
    try {
      // fetch restaurant profile
      const restaurant = await this.restaurantService.findByAdmin(resAdmin.id);
      if (!restaurant) {
        throw new NotFoundException('Check your restaurant status');
      }


      // find menu item
      const Menu = await this.menuRepository.findOne({
        where: { id: menuId, restaurant: { id: restaurant.id } },
        relations: ['restaurant', 'cuisine'],
      });
      if (!Menu) {
        throw new NotFoundException('Menu item not found');
      }

      // cuisine match
      if (updateMenuDto.cuisineId) {
        const cuisine = await this.cuisineService.findOne(updateMenuDto.cuisineId);
        Menu.cuisine = cuisine;
      }

      //update the object
      Object.assign(Menu, updateMenuDto);
      const updatedMenu = await this.menuRepository.save(Menu);
      return plainToInstance(UpdateMenuDto, updatedMenu, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // search from menu
  async searchMenu(
    queryDto: MenuPaginationDto,
  ): Promise<{ data: PublicMenuDto[]; total: number; page: number; limit: number }> {
    const { page, limit, search, minPrice, maxPrice, cuisine, restaurant } = queryDto;

    try {
      const qb = this.menuRepository
        .createQueryBuilder('Menu')
        .leftJoinAndSelect('Menu.restaurant', 'restaurant')
        .leftJoinAndSelect('Menu.cuisine', 'cuisine')
        .innerJoin('restaurant.restaurantAdmin', 'user') 
        .where('restaurant.deletedAt IS NULL')          
        .andWhere('user.deletedAt IS NULL');           

      if (search) {
        qb.andWhere(
          '(Menu.name ILIKE :search OR Menu.description ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      if (minPrice) {
        qb.andWhere('Menu.price >= :minPrice', { minPrice });
      }
      if (maxPrice) {
        qb.andWhere('Menu.price <= :maxPrice', { maxPrice });
      }

      if (cuisine) {
        qb.andWhere('cuisine.name ILIKE :cuisine', { cuisine: `%${cuisine}%` });
      }

      if (restaurant) {
        qb.andWhere('restaurant.businessName ILIKE :restaurant', {
          restaurant: `%${restaurant}%`,
        });
      }

      qb.skip((page - 1) * limit).take(limit);

      const [items, total] = await qb.getManyAndCount();

      const data = items.map(item =>
        plainToInstance(PublicMenuDto, item, {
          excludeExtraneousValues: true,
        }),
      );

      return { data, total, page, limit };
    } catch (error) {
      throw new BadRequestException('Failed to search menu items: ' + error.message);
    }
  }
  // remove menu items by specific restaurant
  async remove(id: number, user: User): Promise<{ message: string }> {
    try {
      const Menu = await this.menuRepository.findOne({
        where: { id },
        relations: ['restaurant', 'restaurant.restaurantAdmin'],
      });

      if (!Menu) {
        throw new NotFoundException(`Menu item with ID ${id} not found`);
      }
      console.log(Menu);

      // check permissions
      if (user.role === Role.RESTAURANT_ADMIN) {
        if (Menu.restaurant.restaurantAdmin.id !== user.id) {
          throw new ForbiddenException('You are not allowed to delete this menu item');
        }
      }
      await this.menuRepository.remove(Menu);
      return { message: `Menu item with ID ${id} removed successfully` };
    } catch (error) {
      throw new BadRequestException('Failed to remove menu item: ' + error.message);
    }
  }

  // update the reviiew
    async updateReview(dishId: number, avgRating: number): Promise<void> {
    try {
        console.log("update review functioin is called");
        const product = await this.menuRepository.findOne({ where: { id: dishId } });

        if (!product) {
        throw new NotFoundException(`Dish with ID ${dishId} not found`);
        }

        await this.menuRepository.update(dishId, {
        rating: Number(avgRating.toFixed(1)),
        });
    } catch (error) {
        throw new BadRequestException(`Failed to update product review: ${error.message}`);
    }
    }


}
