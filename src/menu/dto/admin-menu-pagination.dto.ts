import { Type } from 'class-transformer';
import { IsIn, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AdminMenuPaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (must be ≥ 1)',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page (default 10)',
    enum: [10, 20],
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @IsIn([10, 20], {message: 'limit must be either 10 or 20'})
  limit: number = 10;
}
