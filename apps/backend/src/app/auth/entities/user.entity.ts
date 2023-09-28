import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('identity', { name: 'id', generatedIdentity: 'BY DEFAULT' })
  id: number;

  @Column({ type: 'character varying' })
  login: string;

  @Column({ type: 'character varying' })
  displayed_nick: string;

  @Column({ type: 'character varying' })
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

  @Column({ type: 'character varying' })
  country: string;

  @Column({ type: 'character varying' })
  avatar: string;

  @Column({ type: 'timestamp', nullable: true })
  comments_ban_date: string;
}
