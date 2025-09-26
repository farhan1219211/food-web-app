import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateRestaurantProfileDto } from './dto/update-restaurant-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantProfile } from './entities/restaurant-profile.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { CreateRestaurantDto } from 'src/auth/dto/create-restaurant.dto';
import { CuisineService } from 'src/cuisine/cuisine.service';
import { RestaurantPaginationDto } from './dto/pagination-search.dto';
import { plainToInstance } from 'class-transformer';
import { RestaurantProfileResponseDto } from './dto/profile-response';
// import { toRestaurantProfileResponse } from './dto/profile-response';
@Injectable()
export class RestaurantProfileService {
  constructor(@InjectRepository(RestaurantProfile) private readonly restaurantRepository: Repository<RestaurantProfile>,
          private readonly cuisineService: CuisineService){}

  // async create(dto: CreateRestaurantProfileDto, restaurantAdmin: User): Promise<RestaurantProfile> {
  //   try {
  //     // check that the id which was given, exists or not
  //     const restaurantAdmin = await this.userService.findOne(dto.assigned_admin_id);

  //     if(!restaurantAdmin || restaurantAdmin.role != Role.RESTAURANT_ADMIN){
  //       throw new BadRequestException('Make sure you are assign a right person to restaurant')
  //     };

  //     // check is admin is not associated with another restaurant
  //     const existingProfile = await this.restaurantRepository.findOne({
  //       where: { restaurantAdmin: { id: dto.assigned_admin_id } },
  //     });
  //     console.log("existing profile is: ",existingProfile);

  //     if (existingProfile) {
  //       console.log("hello world");
  //       throw new BadRequestException(`User with ID ${dto.assigned_admin_id} is already assigned to a restaurant profile`,);
  //     }

  //     const restaurant = RestaurantProfile.from(dto, restaurantAdmin);
  //     console.log("value of restaurant is: ", restaurant);
  //     return await this.restaurantRepository.save(restaurant);
  //   } catch (error) {
  //       throw new BadRequestException(error.message);
  //   }
  // }
  
  // 
  
  // c
  async create(dto: CreateRestaurantDto, restaurantAdmin: User): Promise<RestaurantProfile> {
    try {
      const restaurant = RestaurantProfile.from(dto, restaurantAdmin);
      console.log("value of restaurant is: ", restaurant);
      return await this.restaurantRepository.save(restaurant);
    } catch (error) {
        throw new BadRequestException(error.message);
    }
  }

  // update the restaurant profile
  async update(adminId: number, dto: UpdateRestaurantProfileDto) {
      const restaurant = await this.restaurantRepository.findOne({
        where: { restaurantAdmin: { id: adminId } },
      });

      if (!restaurant) {
        throw new NotFoundException('Restaurant profile not found for this admin');
      }
      console.log("data of restaurant is: ", restaurant);
      //  updte the fields
      Object.assign(restaurant, {
        ...dto,
        phoneNumber: dto.phoneNumber ?? restaurant.phoneNumber,
        logoUrl: dto.logoUrl ?? restaurant.logoUrl,
        coverImageUrl: dto.coverImageUrl ?? restaurant.coverImageUrl,
        description: dto.description ?? restaurant.description,
        minOrderAmount: dto.minOrderAmount ?? restaurant.minOrderAmount,
        deliveryFee: dto.deliveryFee ?? restaurant.deliveryFee,
        deliveryRadiusKm: dto.deliveryRadiusKm ?? restaurant.deliveryRadiusKm,
        avgPreparationTime: dto.avgPreparationTime ?? restaurant.avgPreparationTime,
        openingTime: dto.openingTime ?? restaurant.openingTime,
        closingTime: dto.closingTime ?? restaurant.closingTime,
        isOpen: dto.isOpen ?? restaurant.isOpen,
      });
      console.log("updated restaurant is; ", restaurant);
      console.log("dto.cuisines are: ", dto.cuisines);
        // update cuisines 
      if (dto.cuisines && dto.cuisines.length > 0) {
        const cuisineName = dto.cuisines.map(c => c.name);
        const cuisineEntities = await this.cuisineService.findAllByNames(cuisineName);
        console.log("cuisineEntities are: ", cuisineEntities);
        if (cuisineEntities.length !== cuisineName.length) {
          throw new BadRequestException('Irrelevant cuisines entered');
        }
        restaurant.cuisines = cuisineEntities;
      }
      try {
       return await this.restaurantRepository.save(restaurant);
      } catch (error) {
        throw new BadRequestException('Failed to update restaurant profile');
      }
    }

  // search restaurants
  async findAll( query: RestaurantPaginationDto): Promise<{
    data: any[]; total: number; page: number; limit: number; message?: string;}> {
    const { page = 1, limit = 10, search, city, businessType, cuisineNames, isOpen, minRating, maxRating, minOrderAmount, maxOrderAmount} = query;
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

      // filter by min/max order amount
      if (minOrderAmount) {
        qb.andWhere('restaurant.minOrderAmount >= :minOrderAmount', {
          minOrderAmount,
        });
      }
      if (maxOrderAmount) {
        qb.andWhere('restaurant.minOrderAmount <= :maxOrderAmount', {
          maxOrderAmount,
        });
      }

      const [restaurants, total] = await qb.getManyAndCount();

      // const data = restaurants.map(toRestaurantProfileResponse);
      const data = plainToInstance(RestaurantProfileResponseDto, restaurants);
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
  async findByAdmin(adminId: number): Promise<RestaurantProfile> {
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
      // return toRestaurantProfileResponse(restaurant);
      return restaurant;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  // soft delete
  async softDelete(id: number) {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id },
        relations: ['restaurantAdmin'],
      });

      if (!restaurant) {
        throw new NotFoundException('Restaurant profile not found');
      }
      await this.restaurantRepository.softRemove(restaurant);
      return {
        message: `Restaurant profile with id ${id} has been soft deleted`,
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

}
