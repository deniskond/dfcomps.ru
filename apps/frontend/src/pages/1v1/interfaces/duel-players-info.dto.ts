import { Physics } from '~shared/enums/physics.enum';
import { DuelPlayerInfoInterface } from './duel-player-info.interface';

export interface DuelPlayersInfoDtoInterface {
  matchId: string;
  firstPlayerId: string;
  secondPlayerId: string;
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
