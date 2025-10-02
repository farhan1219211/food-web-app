import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { CreateRestaurantDto } from 'src/auth/dto/create-restaurant.dto';
import { CuisineService } from 'src/cuisine/cuisine.service';
import { RestaurantPaginationDto } from './dto/pagination-search.dto';
import { plainToInstance } from 'class-transformer';
import { RestaurantResponseDto } from './dto/profile-response';
import { STATUS_CODES } from 'http';
// import { toRestaurantResponse } from './dto/profile-response';
@Injectable()
export class RestaurantService {
  constructor(@InjectRepository(Restaurant) private readonly restaurantRepository: Repository<Restaurant>,
          private readonly cuisineService: CuisineService){}

 
  async create(dto: CreateRestaurantDto, restaurantAdmin: User): Promise<Restaurant> {
    try {
      const restaurant = Restaurant.from(dto, restaurantAdmin);
      console.log("value of restaurant is: ", restaurant);
      return await this.restaurantRepository.save(restaurant);
    } catch (error) {
        throw new BadRequestException(error.message);
    }
  }

  // update the restaurant profile
  async update(adminId: number, dto: UpdateRestaurantDto) {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { restaurantAdmin: { id: adminId } },
        relations: ['cuisines'],
      });

      if (!restaurant) {
        throw new NotFoundException('Restaurant not found');
      }

      // If cuisines are provided in DTO
      if (dto?.cuisines?.length) {
        const newCuisines = await this.cuisineService.findAllByIds(dto.cuisines);

        //  old + new 
        restaurant.cuisines = [
          ...restaurant.cuisines,
          ...newCuisines.filter(
            nc => !restaurant.cuisines.some(c => c.id === nc.id),
          ),
        ];
      }
      Object.assign(restaurant, { ...dto, cuisines: restaurant.cuisines });

      await this.restaurantRepository.save(restaurant);
      return 'Restaurant updated successfully';
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to update restaurant');
    }
  }



  // search restaurants
  async findAll( query: RestaurantPaginationDto): Promise<{
    data: any[]; total: number; page: number; limit: number; message?: string;}> {
    const { page = 1, limit = 10, search, city, businessType, cuisineNames, isOpen, minRating, maxRating} = query;
    try {
      const qb = this.restaurantRepository
        .createQueryBuilder('restaurant')
        .leftJoinAndSelect('restaurant.cuisines', 'cuisine')
        .innerJoin('restaurant.restaurantAdmin', 'user') 
        .where('user.deletedAt IS NULL') 
        .orderBy('restaurant.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      // Search by business name, description, or city
      if (search) {
        qb.andWhere(
          '(restaurant.businessName ILIKE :search OR restaurant.description ILIKE :search OR restaurant.city ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      // filter by city
      if (city) {
        qb.andWhere('restaurant.city ILIKE :city', { city: `%${city}%` });
      }

      // filter by business type
      if (businessType) {
        qb.andWhere('restaurant.businessType = :businessType', { businessType });
      }

      // filter by cuisines
      let cuisineList: string[] = [];
      if (cuisineNames) {
        cuisineList = Array.isArray(cuisineNames) ? cuisineNames : [cuisineNames];
        qb.andWhere('LOWER(cuisine.name) IN (:...cuisineList)', {
          cuisineList: cuisineList.map((c) => c.toLowerCase()),
        });
      }


      // filter by open/closed status
      if (typeof isOpen === 'boolean') {
        qb.andWhere('restaurant.isOpen = :isOpen', { isOpen });
      }

      // filter by rating
      if (minRating) {
        qb.andWhere('restaurant.rating >= :minRating', { minRating });
      }
      if (maxRating) {
        qb.andWhere('restaurant.rating <= :maxRating', { maxRating });
      }

      const [restaurants, total] = await qb.getManyAndCount();
      console.log(restaurants);
      // const data = restaurants.map(toRestaurantResponse);
      const data = plainToInstance(RestaurantResponseDto, restaurants);
      return {
        data,
        total,
        page,
        limit,
        message: data.length === 0 ? 'No restaurants found' : undefined,
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  // find restaurant using admin id
  async findByAdmin(adminId: number): Promise<Restaurant> {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: {
          restaurantAdmin: { id: adminId },
        },
        relations: ['cuisines', 'restaurantAdmin'], 
      });
      
      if (!restaurant) {
        throw new NotFoundException('Restaurant profile not found for this admin');
      }
      // return toRestaurantResponse(restaurant);
      return restaurant;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

    // soft delete
  async softDelete(id: number) {
    try {
      const result = await this.restaurantRepository.softDelete(id)
      if(result.affected === 0){
        throw new BadRequestException(`failed to delete account`)
      }
      return {
        message: `Restaurant profile with id ${id} has been soft deleted`,
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

}
