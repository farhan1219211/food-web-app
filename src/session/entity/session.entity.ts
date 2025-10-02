import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    RelationId,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity()
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
