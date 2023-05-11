import { MapInterface } from '../services/interfaces/map.interface';
import { Physics } from './../../../enums/physics.enum';
import { DuelPlayerInfoInterface } from './duel-player-info.interface';

export interface DuelPlayersInfoInterface {
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
  map: MapInterface | null;
  firstPlayerInfo: DuelPlayerInfoInterface;
  secondPlayerInfo: DuelPlayerInfoInterface;
  firstPlayerRatingChange: number | null;
  secondPlayerRatingChange: number | null;
  securityCode: string;
}
