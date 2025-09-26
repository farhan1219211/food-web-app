import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { RestaurantProfile } from 'src/restaurant-profile/entities/restaurant-profile.entity';
import { Cuisine } from 'src/cuisine/entities/cuisine.entity';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';

@Entity()
export class MenuItem {
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

  @ManyToOne(() => RestaurantProfile, (restaurant) => restaurant.menuItems, {onDelete: 'CASCADE'})
  restaurant: RestaurantProfile;
  @RelationId((menuItem: MenuItem) => menuItem.restaurant)
  restaurantId: number;

  @ManyToOne(() => Cuisine, (cuisine) => cuisine.menuItems, {nullable: true, onDelete: 'SET NULL'})
  cuisine: Cuisine;
  @RelationId((menuItem: MenuItem) => menuItem.cuisine)
  cuisineId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

from(dto: CreateMenuItemDto) {
  this.name = dto.name;
  this.description = dto.description ?? '';
  this.price = dto.price;
  this.isAvailable = dto.isAvailable;
  this.imageUrl = dto.imageUrl ?? '';
}

}
