import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from 'typeorm';
import { CupResult } from './cup-result.entity';
import { News } from '../../news/entities/news.entity';
import { RatingChange } from '../../news/entities/rating-change.entity';

@Entity({ name: 'cups' })
export class Cup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying' })
  full_name: string;

  @Column({ type: 'character varying' })
  short_name: string;

  @Column({ type: 'character varying' })
  youtube: string;

  @Column({ type: 'character varying' })
  twitch: string;

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

  @Column({ type: 'character varying' })
  map1: string;

  @Column({ type: 'character varying' })
  map2: string;

  @Column({ type: 'character varying' })
  map3: string;

  @Column({ type: 'character varying' })
  map4: string;

  @Column({ type: 'character varying' })
  map5: string;

  @Column({ type: 'character varying' })
  physics: string;

  @Column({ type: 'character varying' })
  type: string;

  @Column({ type: 'character varying' })
  map_weapons: string;

  @Column({ type: 'character varying' })
  map_author: string;

  @Column({ type: 'character varying' })
  map_pk3: string;

  @Column({ type: 'character varying' })
  map_size: string;

  @Column({ type: 'integer' })
  multicup_id: number;

  @Column({ type: 'character varying' })
  archive_link: string;

  @Column({ type: 'integer' })
  bonus_rating: number;

  @Column({ type: 'character varying' })
  system: string;

  @Column({ type: 'character varying' })
  custom_map: string;

  @Column({ type: 'character varying' })
  custom_news: string;

  @Column({ type: 'character varying' })
  validation_archive_link: string;

  @Column({ type: 'integer' })
  start_time: number;

  @Column({ type: 'integer' })
  end_time: number;

  @Column({ type: 'boolean' })
  timer: boolean;

  @Column({ type: 'boolean' })
  rating_calculated: boolean;

  @Column({ type: 'boolean' })
  use_two_servers: boolean;

  @Column({ type: 'boolean' })
  demos_validated: boolean;

  @OneToMany(() => CupResult, (cupResult) => cupResult.cup, { nullable: true })
  cupResults: CupResult[];

  @OneToMany(() => News, (news) => news.cup, { nullable: true })
  news: News[];

  @OneToMany(() => RatingChange, (ratingChange) => ratingChange.cup)
  ratingChange: RatingChange[];
}
