import { NewsTypes } from '../../../app/enums/news-types.enum';
import { AdminNewsDto } from '../models/admin-news.dto';
import { AdminNewsInterface } from '../models/admin-news.interface';
import { getHumanTime } from './get-human-time';

export function mapAdminNewsDtoToInterface(adminNewsDtoArray: AdminNewsDto[]): AdminNewsInterface[] {
  return adminNewsDtoArray.map(mapAdminSingleNewsDtoToInterface);
}

function mapAdminSingleNewsDtoToInterface(adminNewsDto: AdminNewsDto): AdminNewsInterface {
  return {
    id: adminNewsDto.id,
    headerRussian: adminNewsDto.header,
    headerEnglish: adminNewsDto.header_en,
    textRussian: adminNewsDto.text,
    textEnglish: adminNewsDto.text_en,
    typeName: getNewsTypeName(+adminNewsDto.type_id),
    date: getHumanTime(adminNewsDto.datetimezone),
    type: getNewsType(+adminNewsDto.type_id),
  };
}

function getNewsTypeName(type: number): string {
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

function getNewsType(type: number): NewsTypes {
  return {
    1: NewsTypes.ONLINE_RESULTS,
    2: NewsTypes.ONLINE_ANNOUNCE,
    3: NewsTypes.SIMPLE,
    4: NewsTypes.OFFLINE_START,
    5: NewsTypes.OFFLINE_RESULTS,
    6: NewsTypes.MULTICUP_RESULTS,
    7: NewsTypes.DFWC_RESULTS,
    8: NewsTypes.REFLEX_OFFLINE_RESULTS,
    9: NewsTypes.REFLEX_OFFLINE_START,
  }[type]!;
}
