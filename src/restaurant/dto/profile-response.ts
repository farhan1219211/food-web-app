import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { BusinessType } from '../enums/business-type.enum';
import { CuisineResponseDto } from 'src/cuisine/dto/response.dto';

export class RestaurantResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  businessName: string;

  @Expose()
  @ApiProperty({ enum: BusinessType })
  businessType: BusinessType;

  @Expose()
  @ApiProperty()
  location: string;

  @Expose()
  @ApiProperty()
  city: string;

  @Expose()
  @ApiProperty()
  phoneNumber: string;

  @Expose()
  @ApiProperty({ required: false })
  email?: string;

  @Expose()
  @ApiProperty({ required: false })
  logoUrl?: string;

  @Expose()
  @ApiProperty({ required: false })
  coverImageUrl?: string;

  @Expose()
  @ApiProperty({ required: false })
  description?: string;

  @Expose()
  @ApiProperty({ type: () => [CuisineResponseDto] })
  @Type(() => CuisineResponseDto)  
  cuisines: CuisineResponseDto[];

  @Expose()
  @ApiProperty()
  deliveryFee: number;

  @Expose()
  @ApiProperty()
  deliveryRadiusKm: number;

  @Expose()
  @ApiProperty()
  avgPreparationTime: number;

  @Expose()
  @ApiProperty()
  openingTime: string;

  @Expose()
  @ApiProperty()
  closingTime: string;

  @Expose()
  @ApiProperty()
  isOpen: boolean;

  @Expose()
  @ApiProperty()
  rating: number;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}
