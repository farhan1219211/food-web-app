import { Type } from 'class-transformer';
import { 
  IsInt, 
  IsOptional, 
  Min, 
  IsIn, 
  IsString, 
  IsEnum, 
  IsBoolean, 
  IsNumber, 
  Max
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BusinessType } from '../enums/business-type.enum';

export class RestaurantPaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (must be ≥ 1)',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Page must be at least 1' })
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page (only 10 or 20 allowed)',
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Search by name, phone, or city (case-insensitive)',
    example: 'Pizza Hut',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by city (case-insensitive)',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Filter by type (restaurant, home kitchen)',
    enum: BusinessType,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(BusinessType)
  businessType?: BusinessType;

  @ApiPropertyOptional({
    description: 'Filter by cuisine names (array of strings)',
    example: ['thai', 'chinese'],
    type: [String],
    nullable: true,
  })
  @IsOptional()
  cuisineNames?: string[] | string;


  @ApiPropertyOptional({
    description: 'Filter by open/closed status',
    example: true,
    nullable: true,
  })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;

  @ApiPropertyOptional({
    description: 'Minimum rating (0–5)',
    nullable: true,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Max(5)
  @Min(1)
  minRating?: number;

  @ApiPropertyOptional({
    description: 'Maximum rating (0–5)',
    nullable: true,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Max(5)
  @Min(1)
  maxRating?: number;

  @ApiPropertyOptional({
    description: 'Maximum order amount filter',
    nullable: true,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  maxOrderAmount?: number;
}
