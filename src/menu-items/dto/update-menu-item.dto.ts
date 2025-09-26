import { PartialType, PickType } from "@nestjs/swagger";
import { MenuItemDto } from "./menu-item.dto";
import { Expose } from "class-transformer";
import { CreateMenuItemDto } from "./create-menu-item.dto";

export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {
  @Expose()
  name?: string;

  @Expose()
  description?: string;

  @Expose()
  price?: number;

  @Expose()
  isAvailable?: boolean;

  @Expose()
  imageUrl?: string;

  @Expose()
  cuisineId?: number;
}
