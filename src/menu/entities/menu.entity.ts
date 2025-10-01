import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  RelationId,
  OneToMany,
} from 'typeorm';
import { Restaurant
 } from 'src/restaurant/entities/restaurant.entity';
import { Cuisine } from 'src/cuisine/entities/cuisine.entity';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { Favourite } from 'src/favourite/entities/favourite.entity';
import { CartDish } from 'src/cart-dishes/entities/cart-dish.entity';
import { OrderDishes } from 'src/order/entities/order-dishes.entity';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ nullable: true })
  imageUrl: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menu, {onDelete: 'CASCADE'})
  restaurant: Restaurant;
  @RelationId((menu: Menu) => menu.restaurant)
  restaurantId: number;

  @ManyToOne(() => Cuisine, (cuisine) => cuisine.menu, {nullable: true, onDelete: 'SET NULL'})
  cuisine: Cuisine;
  @RelationId((menu: Menu) => menu.cuisine)
  cuisineId: number;

  @OneToMany(() => Favourite, (favourite) => favourite.menu, { cascade: true })
  favourites: Favourite[];

  @OneToMany(() => CartDish, (cartDish) => cartDish.menu, {cascade: true})
  cartDishes: CartDish[];

  @OneToMany(() => OrderDishes, (orderDish)=> orderDish.dish, {cascade: true})
  orderDishes: OrderDishes[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

from(dto: CreateMenuDto) {
  this.name = dto.name;
  this.description = dto.description ?? '';
  this.price = dto.price;
  this.isAvailable = dto.isAvailable;
  this.imageUrl = dto.imageUrl ?? '';
}

}
