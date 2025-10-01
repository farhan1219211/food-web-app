import { Expose, Type } from 'class-transformer';
import { PublicMenuDto } from 'src/menu/dto/public-menu.dto';

export class PublicFavouriteDto {
  @Expose()
  id: number; 

  @Expose()
  @Type(() => PublicMenuDto)
  menu: PublicMenuDto;
}
