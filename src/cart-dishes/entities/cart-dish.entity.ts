import { Min } from "class-validator";
import { Cart } from "src/cart/entities/cart.entity";
import { Menu } from "src/menu/entities/menu.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";

@Entity()
export class CartDish {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Cart, (cart) => cart.cartItems, {onDelete: 'CASCADE'})
    cart: Cart;
    @RelationId((cartDish: CartDish) => cartDish.cart)
    cartId: number;

    @ManyToOne(() => Menu, (menu) => menu.cartDishes, {onDelete: 'CASCADE'})
    menu: Menu;
    @RelationId((cartDish: CartDish) => cartDish.menu)
    dishId: number;

    @Column({ type: 'int', default: 1 })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;
    
}
