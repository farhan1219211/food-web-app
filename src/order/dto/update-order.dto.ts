import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../enum/order-status.enum';


export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, description: 'New status of the order' })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
