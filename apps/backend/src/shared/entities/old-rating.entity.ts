import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'old_ratings' })
export class OldRating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  cpm_rating: number;

  @Column({ type: 'integer' })
  vq3_rating: number;

  @Column({ type: 'integer' })
  season: number;

  @ManyToOne(() => User)
  user: User;
}
