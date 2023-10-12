import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { Cup } from './cup.entity';
import { Physics, VerifiedStatuses } from '@dfcomps/contracts';
import { User } from './user.entity';

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

  @Column({ type: 'character varying' })
  verified_status: VerifiedStatuses;

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
