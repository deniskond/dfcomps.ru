import { PrimaryGeneratedColumn, Column, Entity, ManyToOne, CreateDateColumn } from 'typeorm';
import { Physics } from '@dfcomps/contracts';
import { User } from './user.entity';

@Entity({ name: 'world_records' })
export class WorldRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying' })
  map: string;

  @Column({ type: 'character varying' })
  physics: Physics;

  @Column({ type: 'real' })
  time: number;

  @Column({ type: 'character varying' })
  demopath: string;

  @CreateDateColumn({ type: 'timestamp' })
  uploaded_at: Date;

  @ManyToOne(() => User, { nullable: true })
  player: User | null;

  @Column({ type: 'character varying', nullable: true })
  df_name: string | null;

  @Column({ type: 'character varying', nullable: true })
  df_country: string | null;

  @ManyToOne(() => User)
  uploader: User;
}
