import { PrimaryGeneratedColumn, Column, Entity, OneToMany, ManyToOne } from 'typeorm';
import { CupResult } from './cup-result.entity';
import { CupTypes, Physics } from '@dfcomps/contracts';
import { Multicup } from './multicup.entity';
import { CupDemo } from './cup-demo.entity';
import { RatingChange } from './rating-change.entity';
import { News } from './news.entity';

@Entity({ name: 'cups' })
export class Cup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying' })
  full_name: string;

  @Column({ type: 'character varying' })
  short_name: string;

  @Column({ type: 'character varying', nullable: true })
  youtube: string | null;

  @Column({ type: 'character varying', nullable: true })
  twitch: string | null;

  @Column({ type: 'integer' })
  current_round: number;

  @Column({ type: 'timestamp with time zone' })
  start_datetime: string;

  @Column({ type: 'timestamp with time zone' })
  end_datetime: string;

  @Column({ type: 'character varying' })
  server1: string;

  @Column({ type: 'character varying' })
  server2: string;

  @Column({ type: 'character varying', nullable: true })
  map1: string | null;

  @Column({ type: 'character varying', nullable: true })
  map2: string | null;

  @Column({ type: 'character varying', nullable: true })
  map3: string | null;

  @Column({ type: 'character varying', nullable: true })
  map4: string | null;

  @Column({ type: 'character varying', nullable: true })
  map5: string | null;

  @Column({ type: 'character varying' })
  physics: Physics | 'mixed';

  @Column({ type: 'character varying' })
  type: CupTypes;

  @Column({ type: 'character varying' })
  map_weapons: string;

  @Column({ type: 'character varying' })
  map_author: string;

  @Column({ type: 'character varying' })
  map_pk3: string;

  @Column({ type: 'character varying' })
  map_size: string;

  @Column({ type: 'character varying', nullable: true })
  archive_link: string | null;

  @Column({ type: 'integer' })
  bonus_rating: number;

  @Column({ type: 'character varying', nullable: true })
  system: string | null;

  @Column({ type: 'character varying', nullable: true })
  custom_map: string | null;

  @Column({ type: 'character varying', nullable: true })
  custom_news: string | null;

  @Column({ type: 'character varying', nullable: true })
  validation_archive_link: string | null;

  @Column({ type: 'character varying', nullable: true })
  streamers_archive_link: string | null;

  @Column({ type: 'boolean' })
  timer: boolean;

  @Column({ type: 'boolean' })
  rating_calculated: boolean;

  @Column({ type: 'boolean' })
  use_two_servers: boolean;

  @Column({ type: 'boolean' })
  demos_validated: boolean;

  @Column({ type: 'integer', nullable: true })
  validator_id: number | null;

  @Column({ type: 'character varying', nullable: true })
  logo: string;

  @OneToMany(() => CupResult, (cupResult) => cupResult.cup)
  cupResults: CupResult[];

  @OneToMany(() => News, (news) => news.cup)
  news: News[];

  @OneToMany(() => RatingChange, (ratingChange) => ratingChange.cup)
  ratingChanges: RatingChange[];

  @OneToMany(() => CupDemo, (cupDemo) => cupDemo.cup)
  cupDemos: CupDemo[];

  @ManyToOne(() => Multicup, { nullable: true })
  multicup: Multicup | null;
}
