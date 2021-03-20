import { Physics } from '../../../enums/physics.enum';
import { TimingsConfig } from '../../config/timing';
import { DuelWebsocketServerActions } from '../../enums/duel-websocket-server-actions.enum';
import { PickbanStepMessageInterface } from '../../interfaces/pickban-step-message.interface';

export function pickbanStepMock(firstPlayerId: string, secondPlayerId: string, physics: Physics, maps?: string[], bannedByFirst?: boolean[], bannedBySecond?: boolean[]): PickbanStepMessageInterface {
    return {
        action: DuelWebsocketServerActions.PICKBAN_STEP,
        payload: {
            match: {
                firstPlayerId,
                secondPlayerId,
                isFirstPlayerBanning: expect.any(Boolean),
                isSecondPlayerBanning: expect.any(Boolean),
                maps: [
                    {
                        name: maps ? maps[0] : expect.any(String),
                        isBannedByFirstPlayer: bannedByFirst ? bannedByFirst[0] : false,
                        isBannedBySecondPlayer: bannedBySecond ? bannedBySecond[0] : false,
                        isPickedByFirstPlayer: false,
                        isPickedBySecondPlayer: false,
                    },
                    {
                        name: maps ? maps[1] : expect.any(String),
                        isBannedByFirstPlayer: bannedByFirst ? bannedByFirst[1] : false,
                        isBannedBySecondPlayer: bannedBySecond ? bannedBySecond[1] : false,
                        isPickedByFirstPlayer: false,
                        isPickedBySecondPlayer: false,
                    },
                    {
                        name: maps ? maps[2] : expect.any(String),
                        isBannedByFirstPlayer: bannedByFirst ? bannedByFirst[2] : false,
                        isBannedBySecondPlayer: bannedBySecond ? bannedBySecond[2] : false,
                        isPickedByFirstPlayer: false,
                        isPickedBySecondPlayer: false,
                    },
                    {
                        name: maps ? maps[3] : expect.any(String),
                        isBannedByFirstPlayer: bannedByFirst ? bannedByFirst[3] : false,
                        isBannedBySecondPlayer: bannedBySecond ? bannedBySecond[3] : false,
                        isPickedByFirstPlayer: false,
                        isPickedBySecondPlayer: false,
                    },
                    {
                        name: maps ? maps[4] : expect.any(String),
                        isBannedByFirstPlayer: bannedByFirst ? bannedByFirst[4] : false,
                        isBannedBySecondPlayer: bannedBySecond ? bannedBySecond[4] : false,
                        isPickedByFirstPlayer: false,
                        isPickedBySecondPlayer: false,
                    },
                ],
                physics,
                timer: TimingsConfig.BAN_TIMER_SECONDS,
            },
        },
    };
}
