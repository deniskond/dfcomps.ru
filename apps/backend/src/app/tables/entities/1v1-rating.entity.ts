import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity({ name: '1v1_rating' })
export class OneVOneRating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  playerId: number;

  @Column({ type: 'integer' })
  cpm: string;

  @Column({ type: 'integer' })
  vq3: string;
}
