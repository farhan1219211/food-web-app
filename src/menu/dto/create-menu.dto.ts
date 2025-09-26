import { PickType } from "@nestjs/swagger";
import { MenuDto } from "./menu.dto";

// For creating a new menu item
export class CreateMenuDto extends PickType(MenuDto, [
  'name',
  'description',
  'price',
  'isAvailable',
  'imageUrl',
  'cuisineId',
] as const) {}