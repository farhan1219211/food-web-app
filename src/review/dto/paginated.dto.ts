import { Type } from 'class-transformer';
import { IsInt, Min, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewPaginationDto {
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

  @ApiProperty({
    description: 'Dish ID to fetch reviews for',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  dishId: number;
}
