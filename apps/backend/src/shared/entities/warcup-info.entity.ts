import { MapType } from '@dfcomps/contracts';
import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';

@Entity({ name: 'warcup_info' })
export class WarcupInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean' })
  is_voting_active: boolean;

  @Column({ type: 'integer', nullable: true })
  next_rotation: 1 | 2 | 3;

  @Column({ type: 'integer', nullable: true })
  next_warcup_number: number;

  @Column({ type: 'integer', nullable: true })
  warcup_bot_id: number;
}
