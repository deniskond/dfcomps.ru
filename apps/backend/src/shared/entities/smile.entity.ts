import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'smiles' })
export class Smile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying' })
  alias: string;

  @Column({ type: 'integer' })
  width: number;

  @Column({ type: 'integer' })
  height: number;

  @ManyToOne(() => User, { nullable: true })
  user: User;
}
