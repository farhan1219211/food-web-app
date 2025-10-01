import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { OrderStatus } from '../enum/order-status.enum';

export class OrderFilterDto {
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

  @ApiPropertyOptional({ enum: OrderStatus, description: 'Filter by order status' })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
