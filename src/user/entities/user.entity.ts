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
import { RestaurantProfile } from 'src/restaurant-profile/entities/restaurant-profile.entity';

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

    @OneToMany(() => Session, (session) => session.user, { cascade: true })
    sessions: Session[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToOne(() => RestaurantProfile, (restaurant) => restaurant.restaurantAdmin)
    restaurantProfile: RestaurantProfile;


    from(userDto: CreateUserDto) {
        this.fullName = userDto.fullName;
        this.phone = userDto.phone ?? '';
        this.isActive = true;
    }
}
