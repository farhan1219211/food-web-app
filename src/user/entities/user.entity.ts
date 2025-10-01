import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToOne,
    OneToMany,
} from 'typeorm';
import { CreateUserDto } from '../../auth/dto/create-user.dto';
import { Role } from '../../common/enum/role.enum';
import { Auth } from 'src/auth/entity/auth.entity';
import { IsOptional } from 'class-validator';
import { Session } from 'src/session/entity/session.entity';
import { Restaurant } from 'src/restaurant/entities/restaurant.entity';
import { Favourite } from 'src/favourite/entities/favourite.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { Order } from 'src/order/entities/order.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fullName: string;

    @Column({ nullable: true })
    @IsOptional()
    address?: string;

    @Column({ nullable: true })
    phone: string;

    @Column({
        type: 'enum',
        enum: Role,
        nullable: false,
    })
    role: Role;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    avatarUrl: string;

    @OneToOne(() => Auth, (auth) => auth.user, {
        cascade: true,
    })
    auth: Auth;

    @OneToOne( ()=> Cart, (cart) => cart.user, {nullable: true})
    cart: Cart;

    @OneToMany(() => Session, (session) => session.user, { cascade: true })
    sessions: Session[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToOne(() => Restaurant, (restaurant) => restaurant.restaurantAdmin)
    restaurant: Restaurant;

    @OneToMany(()=> Favourite, (favourite) => favourite.user, {cascade: true})
    favourite: Favourite[];

    @OneToMany(()=>Order, (order) => order.customer, {nullable: true})
    order: Order[]

    from(userDto: CreateUserDto) {
        this.fullName = userDto.fullName;
        this.phone = userDto.phone ?? '';
        this.isActive = true;
    }
}
