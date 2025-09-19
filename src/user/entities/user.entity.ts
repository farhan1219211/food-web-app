import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { Role } from '../../common/enum/role.enum';
import { Auth } from 'src/auth/entity/auth.entity';
import { IsOptional } from 'class-validator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({nullable: true})
  @IsOptional()
  address?: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CUSTOMER,
  })
  role: Role;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  avatarUrl: string;

  // @OneToOne(() => Auth, (auth) => auth.user, { cascade: true, onDelete: 'CASCADE' })
  // auth: Auth;


  @OneToOne(() => Auth, (auth) => auth.user, {
    onDelete: 'CASCADE', 
  })
  @JoinColumn() 
  auth: Auth;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;


from(userDto: CreateUserDto) {
    this.fullName = userDto.fullName;
    this.phone = userDto.phone ?? '';
    this.role = userDto.role ?? Role.CUSTOMER;
    this.isActive = true;
  }
}
