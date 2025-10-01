import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../enum/order-status.enum';
import { OrderDishesResponseDto } from './order-dishes-response.dto';

export class OrderResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({ example: 499.99 })
  totalPrice: number;

  @ApiProperty({ example: '123 Street, Lahore' })
  shippingAddress: string;

  @ApiProperty({ example: '03123456789' })
  phoneNumber: string;

  @ApiProperty({ type: [OrderDishesResponseDto] })
  dishes: OrderDishesResponseDto[];

  @ApiProperty({ example: '2025-09-30T12:00:00.000Z' })
  createdAt: Date;
}
