import { BadRequestException, ConsoleLogger, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { RestaurantProfileService } from 'src/restaurant-profile/restaurant-profile.service';
import { CuisineService } from 'src/cuisine/cuisine.service';
import { PublicMenuItemDto } from './dto/public-menu-items.dto';
import { plainToInstance } from 'class-transformer';
import { MenuItemPaginationDto } from './dto/menu-item-pagination.dto';
import { AdminMenuPaginationDto } from './dto/admin-menu-pagination.dto';
import { Role } from 'src/common/enum/role.enum';

@Injectable()
export class MenuItemsService {
  constructor(@InjectRepository(MenuItem) private readonly menuItemRepository: Repository<MenuItem>,
      private readonly restaurantProfile: RestaurantProfileService,
      private readonly cuisineService: CuisineService){}

  // create menu item for specific restaurant
  async create(resAdmin: User, createMenuItemDto: CreateMenuItemDto): Promise<PublicMenuItemDto>{
    try {
      // fetch profile of restaurant 
      const restaurantProfile = await this.restaurantProfile.findByAdmin(resAdmin.id);
      if(!restaurantProfile){
        throw new NotFoundException('Check you restaurant status')
      }

      // fetch cuisine
      const cuisine = await this.cuisineService.findOne(createMenuItemDto.cuisineId);

      // console.log("cuisiine is: ", cuisine);
      // console.log(restaurantProfile);
      const menuItem = new MenuItem();
      menuItem.from(createMenuItemDto);
      menuItem.restaurant = restaurantProfile;
      menuItem.cuisine = cuisine;
      console.log(menuItem);
      const saveMenu = await this.menuItemRepository.save(menuItem);
      return plainToInstance(PublicMenuItemDto, saveMenu, {
      excludeExtraneousValues: true,
    });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // restaurant admin can fetch his all orders
  async findByAdmin(adminId: number, { page, limit }: AdminMenuPaginationDto ): Promise<{ data: PublicMenuItemDto[]; total: number; page: number; limit: number }> {
    try {
      const qb = this.menuItemRepository
        .createQueryBuilder('menuItem')
        .leftJoinAndSelect('menuItem.restaurant', 'restaurant')
        .leftJoinAndSelect('menuItem.cuisine', 'cuisine')
        .where('restaurant.restaurantAdminId = :adminId', { adminId })
        .orderBy('menuItem.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [items, total] = await qb.getManyAndCount();

      const data = items.map(item =>
        plainToInstance(PublicMenuItemDto, item, {
          excludeExtraneousValues: true,
        }),
      );

      return { data, total, page, limit };
    } catch (error) {
      throw new BadRequestException('Failed to fetch menu items: ' + error.message);
    }
  }

  // update the menu
  async update( resAdmin: User, menuId: number, updateMenuItemDto: UpdateMenuItemDto,): Promise<UpdateMenuItemDto> {
    try {
      // fetch restaurant profile
      const restaurantProfile = await this.restaurantProfile.findByAdmin(resAdmin.id);
      if (!restaurantProfile) {
        throw new NotFoundException('Check your restaurant status');
      }

      // find menu item
      const menuItem = await this.menuItemRepository.findOne({
        where: { id: menuId, restaurant: { id: restaurantProfile.id } },
        relations: ['restaurant', 'cuisine'],
      });
      if (!menuItem) {
        throw new NotFoundException('Menu item not found');
      }

      // cuisine match
      if (updateMenuItemDto.cuisineId) {
        const cuisine = await this.cuisineService.findOne(updateMenuItemDto.cuisineId);
        menuItem.cuisine = cuisine;
      }

      //update the object
      Object.assign(menuItem, updateMenuItemDto);
      const updatedMenu = await this.menuItemRepository.save(menuItem);
      return plainToInstance(UpdateMenuItemDto, updatedMenu, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // search from menu
  async searchMenu(
    queryDto: MenuItemPaginationDto,
  ): Promise<{ data: PublicMenuItemDto[]; total: number; page: number; limit: number }> {
    const { page, limit, search, minPrice, maxPrice, cuisine, restaurant } = queryDto;

    try {
      const qb = this.menuItemRepository
        .createQueryBuilder('menuItem')
        .leftJoinAndSelect('menuItem.restaurant', 'restaurant')
        .leftJoinAndSelect('menuItem.cuisine', 'cuisine')
        .innerJoin('restaurant.restaurantAdmin', 'user') 
        .where('restaurant.deletedAt IS NULL')          
        .andWhere('user.deletedAt IS NULL');           

      if (search) {
        qb.andWhere(
          '(menuItem.name ILIKE :search OR menuItem.description ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      if (minPrice) {
        qb.andWhere('menuItem.price >= :minPrice', { minPrice });
      }
      if (maxPrice) {
        qb.andWhere('menuItem.price <= :maxPrice', { maxPrice });
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
        plainToInstance(PublicMenuItemDto, item, {
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
      const menuItem = await this.menuItemRepository.findOne({
        where: { id },
        relations: ['restaurant', 'restaurant.restaurantAdmin'],
      });

      if (!menuItem) {
        throw new NotFoundException(`Menu item with ID ${id} not found`);
      }
      console.log(menuItem);

      // check permissions
      if (user.role === Role.RESTAURANT_ADMIN) {
        if (menuItem.restaurant.restaurantAdmin.id !== user.id) {
          throw new ForbiddenException('You are not allowed to delete this menu item');
        }
      }
      await this.menuItemRepository.remove(menuItem);
      return { message: `Menu item with ID ${id} removed successfully` };
    } catch (error) {
      throw new BadRequestException('Failed to remove menu item: ' + error.message);
    }
  }


}
