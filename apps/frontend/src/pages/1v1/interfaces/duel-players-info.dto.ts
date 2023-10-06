import { Physics } from '@dfcomps/contracts';
import { DuelPlayerInfoInterface } from './duel-player-info.interface';

export interface DuelPlayersInfoDtoInterface {
  matchId: string;
  firstPlayerId: number;
  secondPlayerId: number;
  firstPlayerTime: string | null;
  firstPlayerDemo: string | null;
  secondPlayerTime: string | null;
  secondPlayerDemo: string | null;
  startDatetime: string;
  isFinished: string;
  physics: Physics;
  map: string;
  firstPlayerInfo: DuelPlayerInfoInterface;
  secondPlayerInfo: DuelPlayerInfoInterface;
  firstPlayerRatingChange: string | null;
  secondPlayerRatingChange: string | null;
  securityCode: string;
}
