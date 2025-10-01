import { CartDish } from "src/cart-dishes/entities/cart-dish.entity";
import { User } from "src/user/entities/user.entity";
import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Cart {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, (user) => user.cart, {onDelete: 'CASCADE'})
    @JoinColumn()
    user: User;


    @OneToMany(() => CartDish, (cartDish) => cartDish.cart, { cascade: true })
    cartItems: CartDish[];

}
