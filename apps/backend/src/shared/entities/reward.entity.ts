import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Rewards } from '@dfcomps/contracts';

@Entity({ name: 'rewards' })
export class Reward {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying' })
  name_en: Rewards;

  @ManyToOne(() => User)
  user: User;
}
