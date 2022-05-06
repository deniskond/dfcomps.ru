import { AdminNewsDto } from '../models/admin-news.dto';
import { AdminNewsInterface } from '../models/admin-news.interface';
import * as moment from 'moment-timezone';

export function mapAdminNewsDtoToInterface(adminNewsDtoArray: AdminNewsDto[]): AdminNewsInterface[] {
  return adminNewsDtoArray.map((adminNewsDto: AdminNewsDto) => ({
    id: adminNewsDto.id,
    headerRussian: adminNewsDto.header,
    headeEnglish: adminNewsDto.header_en,
    textRussian: adminNewsDto.text,
    textEnglish: adminNewsDto.text_en,
    type: getNewsType(+adminNewsDto.type_id),
    date: getHumanTime(adminNewsDto.datetimezone),
  }));
}

function getNewsType(type: number): string {
  return {
    1: 'Online cup results',
    2: 'Online cup announcement',
    3: 'Text',
    4: 'Offline cup start',
    5: 'Offline cup results',
    6: 'Multicup results',
    7: 'DFWC round results',
    8: 'Legacy',
    9: 'Legacy',
  }[type]!;
}

function getHumanTime(time: string): string {
  return moment(time).tz('Europe/Moscow').format('DD.MM.YYYY HH:mm') + ' MSK';
}
