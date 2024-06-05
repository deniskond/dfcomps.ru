import { PrimaryGeneratedColumn, Entity, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { MapSuggestion } from './map-suggestion.entity';

@Entity({ name: 'warcup_admin_votes' })
export class WarcupAdminVote {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToOne(() => MapSuggestion)
  @JoinColumn()
  mapSuggestion: MapSuggestion;
}
