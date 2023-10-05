import { PrimaryGeneratedColumn, Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity({ name: '1v1_rating' })
export class OneVOneRating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  cpm: number;

  @Column({ type: 'integer' })
  vq3: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
