import { Menu } from "src/menu/entities/menu.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId, Unique } from "typeorm";

@Entity()
@Unique(['user','menu'])
export class Favourite {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.favourite, {onDelete: 'CASCADE'})
    user: User;
    @RelationId((favourite: Favourite) => favourite.user)
    userId: number;


    @ManyToOne(() => Menu, (menu) => menu.favourites, { onDelete: 'CASCADE' })
    menu: Menu;
    @RelationId((favourite: Favourite) => favourite.menu)
    menuId: number;

}
