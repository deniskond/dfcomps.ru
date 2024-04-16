import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { Cup } from './cup.entity';
import { User } from './user.entity';

@Entity({ name: 'cups_results' })
export class CupResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  round1: number | null;

  @Column({ type: 'integer', nullable: true })
  round2: number | null;

  @Column({ type: 'integer', nullable: true })
  round3: number | null;

  @Column({ type: 'integer', nullable: true })
  round4: number | null;

  @Column({ type: 'integer', nullable: true })
  round5: number | null;

  @Column({ type: 'integer', nullable: true })
  final_sum: number | null;

  @Column({ type: 'real', nullable: true })
  time1: number | null;

  @Column({ type: 'real', nullable: true })
  time2: number | null;

  @Column({ type: 'real', nullable: true })
  time3: number | null;

  @Column({ type: 'real', nullable: true })
  time4: number | null;

  @Column({ type: 'real', nullable: true })
  time5: number | null;

  @Column({ type: 'integer', nullable: true })
  offset: number | null;

  @Column({ type: 'integer' })
  server: number;

  @ManyToOne(() => Cup)
  cup: Cup;

  @ManyToOne(() => User)
  user: User;
}
