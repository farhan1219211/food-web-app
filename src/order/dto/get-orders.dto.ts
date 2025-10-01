import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../enum/order-status.enum';

export class PaginationMetaDto {
  @ApiProperty({ example: 10, description: 'Total number of orders for this user' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ example: 1, description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.PENDING,
    description: 'Filter applied by order status, or ALL if no filter',
  })
  status: OrderStatus | null;
}
