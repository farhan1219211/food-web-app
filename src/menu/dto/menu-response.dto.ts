import { OmitType } from "@nestjs/swagger";
import { MenuDto } from "./menu.dto";
import { Expose } from "class-transformer";

export class MenuResponseDto extends OmitType(MenuDto, [
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
