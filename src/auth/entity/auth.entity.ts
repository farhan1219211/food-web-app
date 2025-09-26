import { IsEmail } from 'class-validator';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Auth {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    @IsEmail()
    email: string;

    @Column()
    password: string;

    @Column({ type: 'varchar', nullable: true })
    resetPasswordToken: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    expiresAt: Date | null;

    @OneToOne(() => User, (user) => user.auth, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;
}
