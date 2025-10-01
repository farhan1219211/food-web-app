import { Expose, Type } from 'class-transformer';
import { PublicRestaurantDto } from 'src/restaurant/dto/restaurant.dto';
export class PublicMenuDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  price: number;

  @Expose()
  isAvailable: boolean;

  @Expose()
  @Type(() => PublicRestaurantDto)
  restaurant: PublicRestaurantDto;
}
