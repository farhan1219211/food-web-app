import { PickType } from "@nestjs/swagger";
import { MenuItemDto } from "./menu-item.dto";

// For creating a new menu item
export class CreateMenuItemDto extends PickType(MenuItemDto, [
  'name',
  'description',
  'price',
  'isAvailable',
  'imageUrl',
  'cuisineId',
] as const) {}