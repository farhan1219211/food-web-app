import { OmitType } from "@nestjs/swagger";
import { MenuItemDto } from "./menu-item.dto";
import { Expose } from "class-transformer";

export class MenuItemResponseDto extends OmitType(MenuItemDto, [
  'updatedAt',
] as const) {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  price: number;

  @Expose()
  isAvailable: boolean;

  @Expose()
  imageUrl: string;

  @Expose()
  restaurantId: number;

  @Expose()
  cuisineId: number;

  @Expose()
  createdAt: Date;
}
