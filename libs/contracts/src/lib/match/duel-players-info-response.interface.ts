import { Physics } from '../global/physics.enum';
import { DuelPlayerInfoInterface } from './duel-player-info.interface';

export interface DuelPlayersInfoResponseInterface {
  matchId: number;
  firstPlayerId: number;
  secondPlayerId: number;
  firstPlayerTime: number | null;
  firstPlayerDemo: string | null;
  secondPlayerTime: number | null;
  secondPlayerDemo: string | null;
  startDatetime: string;
  isFinished: boolean;
  physics: Physics;
  map: string | null;
  firstPlayerInfo: DuelPlayerInfoInterface;
  secondPlayerInfo: DuelPlayerInfoInterface;
  firstPlayerRatingChange: number | null;
  secondPlayerRatingChange: number | null;
  securityCode: string;
}
