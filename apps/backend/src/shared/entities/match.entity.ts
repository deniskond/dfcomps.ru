import { Physics } from '@dfcomps/contracts';
import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity({ name: 'matches' })
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  first_player_id: number;

  @Column({ type: 'integer' })
  second_player_id: number;

  @Column({ type: 'real', nullable: true })
  first_player_time: number | null;

  @Column({ type: 'character varying', nullable: true })
  first_player_demo: string | null;

  @Column({ type: 'real', nullable: true })
  second_player_time: number | null;

  @Column({ type: 'character varying', nullable: true })
  second_player_demo: string | null;

  @Column({ type: 'timestamp with time zone' })
  start_datetime: string;

  @Column({ type: 'boolean' })
  is_finished: boolean;

  @Column({ type: 'character varying' })
  physics: Physics;

  @Column({ type: 'character varying' })
  map: string;

  @Column({ type: 'integer', nullable: true })
  first_player_rating_change: number | null;

  @Column({ type: 'integer', nullable: true })
  second_player_rating_change: number | null;

  @Column({ type: 'character varying' })
  security_code: string;
}
