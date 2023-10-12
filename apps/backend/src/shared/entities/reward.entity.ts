import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Rewards } from '@dfcomps/contracts';

@Entity({ name: 'rewards' })
export class Reward {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying' })
  name_en: Rewards;

  @Column({ type: 'character varying' })
  name_ru: string;

  @Column({ type: 'character varying' })
  icon: string;

  @ManyToOne(() => User)
  user: User;
}
