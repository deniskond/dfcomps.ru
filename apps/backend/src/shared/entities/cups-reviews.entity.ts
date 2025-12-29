import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Cup } from './cup.entity';

@Entity({ name: 'cups_reviews' })
export class CupReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  vote: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Cup)
  cup: Cup;
}
