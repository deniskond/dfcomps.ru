import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from 'typeorm';
import { RatingChange } from '../../news/entities/rating-change.entity';
import { Cup } from './cup.entity';

@Entity({ name: 'multicups' })
export class Multicup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'integer' })
  rounds: number;

  @Column({ type: 'character varying' })
  system: string;

  @OneToMany(() => RatingChange, (ratingChange) => ratingChange.multicup)
  ratingChanges: RatingChange[];

  @OneToMany(() => Cup, (cup) => cup.multicup)
  cups: Cup[];
}
