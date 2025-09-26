import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, IsPhoneNumber, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRestaurantDto {

  @ApiPropertyOptional({ example: '+0514862581', description: 'Primary phone number' })
  @IsOptional()
  @IsPhoneNumber('PK')
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'https://logo.url', description: 'Restaurant logo URL' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://cover.url', description: 'Restaurant cover image URL' })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiPropertyOptional({ example: 'Delicious pizza and fast food', description: 'Description of the restaurant' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [Number], description: 'List of cuisine IDs served by the restaurant', example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)   
  cuisines?: number[];


  @ApiPropertyOptional({ example: 1, description: 'Minimum order amount' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: 200, description: 'Delivery fee in PKR' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  deliveryFee?: number;

  @ApiPropertyOptional({ example: 10, description: 'Delivery radius in km' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  deliveryRadiusKm?: number;

  @ApiPropertyOptional({ example: '00:30:00', description: 'Average preparation time in HH:MM:SS' })
  @IsOptional()
  @IsString()
  avgPreparationTime?: string;

  @ApiPropertyOptional({ example: '09:00:00', description: 'Opening time' })
  @IsOptional()
  @IsString()
  openingTime?: string;

  @ApiPropertyOptional({ example: '22:00:00', description: 'Closing time' })
  @IsOptional()
  @IsString()
  closingTime?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether the restaurant is currently open' })
  @IsOptional()
  isOpen?: boolean;


}
