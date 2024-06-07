import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';

@Entity({ name: 'warcup_info' })
export class WarcupInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean' })
  is_voting_active: boolean;

  @Column({ type: 'integer' })
  next_rotation: 1 | 2 | 3;

  @Column({ type: 'integer' })
  next_warcup_number: number;

  @Column({ type: 'integer' })
  warcup_bot_id: number;

  @Column({ type: 'varchar', nullable: true })
  chosen_map: string | null;
}
