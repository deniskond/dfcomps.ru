import { MapType } from '@dfcomps/contracts';
import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';

@Entity({ name: 'warcup_info' })
export class WarcupInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean' })
  is_voting_active: boolean;

  @Column({ type: 'varchar' })
  next_map_type: MapType.STRAFE | MapType.WEAPON;
}
