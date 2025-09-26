import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, IsNumber, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MenuPaginationDto {
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
    description: 'Search by menu item name or description (case-insensitive)',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Minimum price filter',
    nullable: true,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price filter',

    nullable: true,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Filter by cuisine name (case-insensitive)',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  cuisine?: string;

  @ApiPropertyOptional({
    description: 'Filter by restaurant name (case-insensitive)',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  restaurant?: string;
}
