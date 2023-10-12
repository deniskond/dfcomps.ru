import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Cup } from './cup.entity';
import { Multicup } from './multicup.entity';

@Entity({ name: 'rating_changes' })
export class RatingChange {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  cpm_change: number | null;

  @Column({ type: 'integer', nullable: true })
  vq3_change: number | null;

  @Column({ type: 'integer', nullable: true })
  cpm_place: number | null;

  @Column({ type: 'integer', nullable: true })
  vq3_place: number | null;

  @Column({ type: 'boolean' })
  bonus: boolean;

  @Column({ type: 'integer', nullable: true })
  season: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Cup)
  cup: Cup;

  @ManyToOne(() => Multicup)
  multicup: Multicup;
}
