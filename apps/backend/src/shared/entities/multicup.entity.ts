import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from 'typeorm';
import { Cup } from './cup.entity';
import { MulticupSystems } from '@dfcomps/contracts';
import { RatingChange } from './rating-change.entity';

@Entity({ name: 'multicups' })
export class Multicup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'integer' })
  rounds: number;

  @Column({ type: 'character varying' })
  system: MulticupSystems;

  @OneToMany(() => RatingChange, (ratingChange) => ratingChange.multicup)
  ratingChanges: RatingChange[];

  @OneToMany(() => Cup, (cup) => cup.multicup)
  cups: Cup[];
}
