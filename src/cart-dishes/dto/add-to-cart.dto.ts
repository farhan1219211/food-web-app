import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({
    type: Number,
    description: 'Dish Id required'
  })
  @IsInt()
  dishId: number;


  @ApiProperty({
    type: Number,
    minimum: 1,
    description: 'Quantity must be greater than 0'
  })
  @IsInt()
  @Min(1)
  quantity: number;
}
