import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { RestaurantProfile } from 'src/restaurant-profile/entities/restaurant-profile.entity';
import { MenuItem } from 'src/menu-items/entities/menu-item.entity';
@Entity()
export class Cuisine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => RestaurantProfile, (restaurant) => restaurant.cuisines)
  restaurants: RestaurantProfile[];

  @OneToMany(() => MenuItem, (menuItem) => menuItem.cuisine)
  menuItems: MenuItem[];


  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
