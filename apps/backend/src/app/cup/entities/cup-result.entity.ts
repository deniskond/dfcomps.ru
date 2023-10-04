import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity({ name: 'cups_results' })
export class CupResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  cupId: number;

  @Column({ type: 'integer' })
  playerId: number;

  @Column({ type: 'integer', nullable: true })
  round1: number;

  @Column({ type: 'integer', nullable: true })
  round2: number;

  @Column({ type: 'integer', nullable: true })
  round3: number;

  @Column({ type: 'integer', nullable: true })
  round4: number;

  @Column({ type: 'integer', nullable: true })
  round5: number;

  @Column({ type: 'integer', nullable: true })
  final_sum: number;

  @Column({ type: 'real' })
  time1: number;

  @Column({ type: 'real' })
  time2: number;

  @Column({ type: 'real' })
  time3: number;

  @Column({ type: 'real' })
  time4: number;

  @Column({ type: 'real' })
  time5: number;

  @Column({ type: 'integer', nullable: true })
  offset: number;

  @Column({ type: 'integer', nullable: true })
  server: number;
}
