import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity({ name: 'old_users' })
export class OldUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying' })
  nick: string;

  @Column({ type: 'character varying' })
  displayed_nick: string;

  @Column({ type: 'timestamp', nullable: true })
  last_nick_change_time: string;

  @Column({ type: 'character varying' })
  password: string;

  @Column({ type: 'integer' })
  initial_cpm_rating: string;

  @Column({ type: 'integer' })
  cpm_rating: string;

  @Column({ type: 'integer' })
  initial_vq3_rating: string;

  @Column({ type: 'integer' })
  vq3_rating: string;

  @Column({ type: 'integer' })
  random: string;

  @Column({ type: 'character varying' })
  access: string;

  @Column({ type: 'character varying' })
  country: string;

  @Column({ type: 'character varying' })
  avatar: string;

  @Column({ type: 'integer' })
  team_id: string;

  @Column({ type: 'character varying' })
  team_status: string;

  @Column({ type: 'timestamp', nullable: true })
  comments_ban_date: string;
}
