import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique, RelationId } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Order } from 'src/order/entities/order.entity';
import { Menu } from 'src/menu/entities/menu.entity';
@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', width: 1, unique: false })
  rating: number; 

  @Column({ type: 'text', nullable: true, unique: false })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  customer: User;
  @RelationId((review: Review) => review.customer)
  customerId: number;

  @ManyToOne(() => Menu, (menu) => menu.reviews, { onDelete: 'CASCADE' })
  dish: Menu;
  @RelationId((review: Review) => review.dish)
  dishId: number;

  @ManyToOne(() => Order, (order) => order.reviews, { onDelete: 'CASCADE' })
  order: Order;
  @RelationId((review: Review) => review.order)
  orderId: number;

}
