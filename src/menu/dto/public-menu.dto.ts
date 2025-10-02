import { PickType } from "@nestjs/swagger";
import { MenuDto } from "./menu.dto";
import { Expose } from "class-transformer";

export class PublicMenuDto extends PickType(MenuDto, [
  'id',
  'name',
  'description',
  'price',
  'isAvailable',
  'imageUrl',
  'restaurantId',
  'cuisineId',
  'createdAt',
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
  rating: number;

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
