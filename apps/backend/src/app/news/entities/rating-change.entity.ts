import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Cup } from '../../cup/entities/cup.entity';
import { Multicup } from '../../cup/entities/multicup.entity';

@Entity({ name: 'rating_changes' })
export class RatingChange {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  cpm_change: number;

  @Column({ type: 'integer', nullable: true })
  vq3_change: number;

  @Column({ type: 'integer', nullable: true })
  cpm_place: number;

  @Column({ type: 'integer', nullable: true })
  vq3_place: number;

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
