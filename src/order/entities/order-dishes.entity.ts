import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, RelationId } from 'typeorm';
import { Menu } from 'src/menu/entities/menu.entity';
import { Order } from './order.entity';

@Entity()
export class OrderDishes {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.dishes, { onDelete: 'CASCADE' })
  order: Order;
  @RelationId((orderItem: OrderDishes) => orderItem.order)
  orderId: number;

  @ManyToOne(() => Menu,)
  dish: Menu;
  @RelationId((orderDish: OrderDishes) => orderDish.dish)
  dishId: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; 
}
