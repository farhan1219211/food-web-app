import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, IsPhoneNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BusinessType } from '../enums/business-type.enum';
import { CreateCuisineDto } from '../../cuisine/dto/create-cuisine.dto';

export class UpdateRestaurantProfileDto {

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

  @ApiPropertyOptional({ type: [CreateCuisineDto], isArray: true, description: 'List of cuisines served by the restaurant' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCuisineDto)
  cuisines?: CreateCuisineDto[];

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
