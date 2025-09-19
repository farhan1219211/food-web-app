import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, RelationId } from 'typeorm';
import { Auth } from 'src/auth/entity/auth.entity';


@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Auth, (auth) => auth.sessions, { nullable: true, onDelete: 'CASCADE' })
  auth: Auth;
  @RelationId((session: Session) => session.auth)
  authId: number;

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

