import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { Cup } from './cup.entity';
import { User } from '../../auth/entities/user.entity';
import { Physics } from '@dfcomps/contracts';

@Entity({ name: 'cups_demos' })
export class CupDemo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying' })
  demopath: string;

  @Column({ type: 'character varying' })
  map: string;

  @Column({ type: 'real' })
  time: number;

  @Column({ type: 'character varying' })
  physics: Physics;

  @Column({ type: 'boolean' })
  verified: boolean;

  @Column({ type: 'character varying' })
  reason: string;

  @Column({ type: 'boolean' })
  obs: boolean;

  @Column({ type: 'boolean' })
  impressive: boolean;

  @ManyToOne(() => Cup)
  cup: Cup;

  @ManyToOne(() => User)
  user: User;
}
