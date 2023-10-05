import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from 'typeorm';
import { CupResult } from '../../cup/entities/cup-result.entity';
import { News } from '../../news/entities/news.entity';
import { RatingChange } from '../../news/entities/rating-change.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('identity', { name: 'id', generatedIdentity: 'BY DEFAULT' })
  id: number;

  @Column({ type: 'character varying' })
  login: string;

  @Column({ type: 'character varying' })
  displayed_nick: string;

  @Column({ type: 'character varying', nullable: true })
  password: string;

  @Column({ type: 'character varying', nullable: true })
  discord_tag: string;

  @Column({ type: 'timestamp', nullable: true })
  last_discord_prompt: string;

  @Column({ type: 'character varying' })
  access_token: string;

  @Column({ type: 'timestamp', nullable: true })
  last_nick_change_time: string;

  @Column({ type: 'integer' })
  initial_cpm_rating: number;

  @Column({ type: 'integer' })
  cpm_rating: number;

  @Column({ type: 'integer' })
  initial_vq3_rating: number;

  @Column({ type: 'integer' })
  vq3_rating: number;

  @Column({ type: 'character varying', nullable: true })
  country: string;

  @Column({ type: 'character varying', nullable: true })
  avatar: string;

  @Column({ type: 'timestamp', nullable: true })
  comments_ban_date: string;

  @OneToMany(() => CupResult, (cupResult) => cupResult.user)
  cupResults: CupResult[];

  @OneToMany(() => News, (news) => news.user, { nullable: true })
  news: News[];

  @OneToMany(() => RatingChange, (ratingChange) => ratingChange.user)
  ratingChanges: RatingChange[];
}
