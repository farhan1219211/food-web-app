import { PartialType, PickType } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { CreateMenuDto } from "./create-menu.dto";

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
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
