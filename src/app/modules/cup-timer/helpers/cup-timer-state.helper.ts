import { CupTimerStates } from '../enums/cup-timer-states.enum';
import * as moment from 'moment';

export function getCurrentTimerState(startTime: number, endTime: number): CupTimerStates {
    if (moment().unix() < startTime) {
        return CupTimerStates.AWAITING_START;
    }

    if (moment().unix() < endTime) {
        return CupTimerStates.IN_PROGRESS;
    }

    return CupTimerStates.FINISHED;
}