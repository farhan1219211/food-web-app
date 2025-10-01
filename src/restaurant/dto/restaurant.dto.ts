import { Expose } from 'class-transformer';

export class PublicRestaurantDto {
  @Expose()
  id: number;

  @Expose()
  businessName: string;
}
