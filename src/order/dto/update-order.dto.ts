import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../enum/order-status.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'New status of the order',
    enum: OrderStatus,
    enumName: 'OrderStatus',
  })
  @IsEnum(OrderStatus, { message: 'Invalid order status' })
  status: OrderStatus;
}
