import { ApiProperty } from '@nestjs/swagger';
import { OrderResponseDto } from './order-response.dto';
import { PaginationMetaDto } from './get-orders.dto';

export class OrdersPaginatedResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  data: OrderResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto;

  @ApiProperty({ example: 'Orders fetched successfully' })
  message: string;
}
