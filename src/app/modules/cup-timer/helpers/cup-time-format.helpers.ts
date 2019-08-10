import { Languages } from '../../../enums/languages.enum';
import * as moment from 'moment';

export function formatCupTime(timestamp: number, language: Languages): string {
    language === Languages.EN ? moment.locale('en') : moment.locale('ru');

    return language === Languages.EN 
        ? `${moment(timestamp * 1000).add(-3, 'hours').format('D MMM YYYY HH:mm')} GMT`.replace('.', '')
        : `${moment(timestamp * 1000).format('D MMM YYYY HH:mm')} МСК`.replace('.', '');
}
