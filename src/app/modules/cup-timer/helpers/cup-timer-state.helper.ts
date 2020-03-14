import { CupTimerStates } from '../enums/cup-timer-states.enum';
import * as moment from 'moment';

export function getCurrentTimerState(startTime: string, endTime: string): CupTimerStates {
    if (moment().isBefore(moment(startTime))) {
        return CupTimerStates.AWAITING_START;
    }

    if (moment().isBefore(moment(endTime))) {
        return CupTimerStates.IN_PROGRESS;
    }

    return CupTimerStates.FINISHED;
}