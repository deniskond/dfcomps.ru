import { PrimaryGeneratedColumn, Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: '1v1_rating' })
export class OneVOneRating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  cpm: number;

  @Column({ type: 'integer' })
  vq3: number;

  @OneToOne(() => User, (user) => user.oneVOneRating)
  @JoinColumn()
  user: User;
}
