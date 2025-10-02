import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  RelationId,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { OrderStatus } from '../enum/order-status.enum';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderDishes } from './order-dishes.entity';
import { Review } from 'src/review/entities/review.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.order, { nullable: true, onDelete: 'CASCADE' })
  customer: User;
  @RelationId((order: Order) => order.customer)
  customerId: number;

  @OneToMany(() => OrderDishes, (dish) => dish.order, { cascade: true })
  dishes: OrderDishes[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @OneToMany(() => Review, (review) => review.order)
  reviews: Review[];


  @Column()
  shippingAddress: string;

  @Column()
  phoneNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static from(dto: CreateOrderDto, customerId: number): Order {
    const order = new Order();
    order.customer = { id: customerId } as User;
    order.status = OrderStatus.PENDING;
    order.shippingAddress = dto.shippingAddress;
    order.phoneNumber = dto.phoneNumber;
    return order;
  }

  calculateTotal(): void {
    this.totalPrice = this.dishes?.reduce(
      (sum, dish) => sum + Number(dish.price) * dish.quantity,
      0,
    ) ?? 0;
  }
}
