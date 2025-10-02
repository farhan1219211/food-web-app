import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartDishDto {
  @ApiProperty({ example: 2, description: 'New quantity of the dish in the cart' })
  @IsInt()
  @Min(1)
  quantity: number;
}
