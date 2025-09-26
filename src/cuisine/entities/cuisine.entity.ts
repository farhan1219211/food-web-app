import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Restaurant } from 'src/restaurant/entities/restaurant.entity';
import { Menu } from 'src/menu/entities/menu.entity';
@Entity()
export class Cuisine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Restaurant, (restaurant) => restaurant.cuisines)
  restaurants: Restaurant[];

  @OneToMany(() => Menu, (menu) => menu.cuisine)
  menu: Menu[];


  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
