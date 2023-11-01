import { DuelPlayerInfoInterface, MapInterface, Physics } from '@dfcomps/contracts';

export interface DuelPlayersInfoInterface {
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
  map: MapInterface | null;
  firstPlayerInfo: DuelPlayerInfoInterface;
  secondPlayerInfo: DuelPlayerInfoInterface;
  firstPlayerRatingChange: number | null;
  secondPlayerRatingChange: number | null;
  securityCode: string;
}
