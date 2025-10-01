import { ApiProperty } from '@nestjs/swagger';
import { MenuResponseDto } from 'src/menu/dto/menu-response.dto';

export class OrderDishesResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 2, description: 'Quantity of the dish ordered' })
  quantity: number;

  @ApiProperty({ example: 249.99, description: 'Price per dish at the time of order' })
  price: number;

  @ApiProperty({ example: { id: 5, name: 'Chicken Burger' } })
  dish: MenuResponseDto;
}
