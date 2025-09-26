import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    RelationId,
} from 'typeorm';
import { Auth } from 'src/auth/entity/auth.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('sessions')
export class Session {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.sessions, { nullable: true, onDelete: 'CASCADE' })
    user: User;
    @RelationId((session: Session) => session.user)
    userId: number;

    @Column()
    accessToken: string;

    @Column()
    refreshToken: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    expiresAt: Date;
}
