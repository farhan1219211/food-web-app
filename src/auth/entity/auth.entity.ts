import { Session } from 'src/session/entity/session.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn, DeleteDateColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/common/enum/role.enum';
import { IsEmail } from 'class-validator';



@Entity('auth')
export class Auth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  password: string; 


  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CUSTOMER,
  })
  role: Role;

  @Column({ type:'varchar' ,nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  // @OneToOne(() => User, (user) => user.auth, { onDelete: 'CASCADE' })
  // @JoinColumn()
  // user: User;

  @OneToOne(() => User, (user) => user.auth, { cascade: true })
  user: User; 

  @OneToMany(() => Session, (session) => session.auth, { cascade: true})  
  sessions: Session[];
  
  @DeleteDateColumn()
  deletedAt: Date;
  

}
