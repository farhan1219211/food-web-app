import { Type } from 'class-transformer';
import { IsInt, IsIn, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CuisinePaginationDto {
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
    description: 'Number of items per page ',
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Search by cuisine ID or name (case-insensitive)',
    example: 'Chinese',
    nullable: true,
  })
  @IsOptional()
  search?: string;
}
