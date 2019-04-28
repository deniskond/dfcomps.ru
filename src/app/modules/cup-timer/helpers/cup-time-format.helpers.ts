import * as moment from 'moment';

export function formatCupTime(timestamp: number): string {
    moment.locale('ru');

    return `${moment(timestamp * 1000).format('D MMM YYYY HH:mm')} МСК`.replace('.', '');
}
