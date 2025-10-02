import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinColumn,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { BusinessType } from '../enums/business-type.enum';
import { Cuisine } from 'src/cuisine/entities/cuisine.entity';
import { Point } from 'geojson';
import { CreateRestaurantDto } from 'src/auth/dto/create-restaurant.dto';
import { IsEnum } from 'class-validator';
import { Menu } from 'src/menu/entities/menu.entity';


@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.restaurant, { onDelete: 'CASCADE' })
  @JoinColumn()
  restaurantAdmin: User;

  @Column()
  businessName: string;

  @Column({
    type: 'enum',
    enum: BusinessType,
    nullable:false
  })
  businessType: BusinessType;

  @Column()
  location: string;

  // @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  // cordinate: Point; 

  @Column()
  city: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl?: string;

  @Column({ name: 'cover_image_url', nullable: true })
  coverImageUrl?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToMany(() => Cuisine, (cuisine) => cuisine.restaurants, {
    cascade: true,
  })
  @JoinTable({
    name: 'restaurant_cuisines',
    joinColumn: { name: 'restaurant_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'cuisine_id', referencedColumnName: 'id' },
  })
  cuisines: Cuisine[];


  @Column({nullable: true})
  registrationNumber?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, nullable: true })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  deliveryRadiusKm?: number;

  @Column({ nullable: true})
  avgPreparationTime?: string;

  @Column({ type: 'time', nullable: true })
  openingTime?: string;

  @Column({ type: 'time', nullable: true })
  closingTime?: string;

  @Column({ default: false })
  isOpen: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => Menu, (menu) => menu.restaurant)
  menu: Menu[];


static from(dto: CreateRestaurantDto, restaurantAdmin: User): Restaurant {
  const restaurant = new Restaurant();

  restaurant.businessName = dto.businessName;
  restaurant.businessType = dto.businessType;
  restaurant.location = dto.location;
  restaurant.city = dto.city;
  restaurant.phoneNumber = dto.phoneNumber;
  restaurant.registrationNumber = dto.registrationNumber;
  restaurant.restaurantAdmin = restaurantAdmin;

  // convert latitude and longitude into  Point
  // restaurant.location = `POINT(${dto.longitude} ${dto.latitude})`
  // restaurant.cordinate = {
  //   type: 'Point',
  //   coordinates: [dto.longitude, dto.latitude],
  // }
  return restaurant;
}
}
