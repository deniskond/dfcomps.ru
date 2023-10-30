import { Physics } from '@dfcomps/contracts';

export interface FinishMatchInterface {
  matches_id: number;
  matches_first_player_id: number;
  matches_second_player_id: number;
  matches_first_player_time: number | null;
  matches_first_player_demo: string | null;
  matches_second_player_time: number | null;
  matches_second_player_demo: string | null;
  matches_start_datetime: string;
  matches_is_finished: boolean;
  matches_physics: Physics;
  matches_map: string;
  matches_first_player_rating_change: number;
  matches_second_player_rating_change: number;
  matches_security_code: 'string';
  first_rating_table_id: number | null;
  first_rating_table_cpm: number | null;
  first_rating_table_vq3: number | null;
  first_rating_table_userId: number | null;
  second_rating_table_id: number | null;
  second_rating_table_cpm: number | null;
  second_rating_table_vq3: number | null;
  second_rating_table_userId: number | null;
}
