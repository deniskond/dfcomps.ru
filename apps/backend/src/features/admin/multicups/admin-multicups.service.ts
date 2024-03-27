import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import {
  AdminActiveMulticupInterface,
  AdminEditMulticupInterface,
  AdminMulticupInterface,
  MulticupActionDto,
} from '@dfcomps/contracts';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAccessInterface } from '../../../shared/interfaces/user-access.interface';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';
import { Multicup } from '../../../shared/entities/multicup.entity';

@Injectable()
export class AdminMulticupsService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Multicup) private readonly multicupsRepository: Repository<Multicup>,
  ) {}

  public async getAllMulticups(accessToken: string | undefined): Promise<AdminMulticupInterface[]> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER, UserRoles.VALIDATOR])) {
      throw new UnauthorizedException('Unauthorized to get admin multicups list without CUP_ORGANIZER role');
    }

    const multicups: Multicup[] = await this.multicupsRepository
      .createQueryBuilder('multicups')
      .leftJoinAndSelect('multicups.cups', 'cups')
      .orderBy('multicups.id', 'DESC')
      .getMany();

    return multicups.map((multicup: Multicup) => ({
      id: multicup.id,
      name: multicup.name,
      rounds: multicup.rounds,
      isFinished: multicup.cups.length === multicup.rounds,
    }));
  }

  public async getSingleMulticup(accessToken: string | undefined, multicupId: number): Promise<AdminEditMulticupInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to get admin multicup info without CUP_ORGANIZER role');
    }

    const multicup: Multicup | null = await this.multicupsRepository
      .createQueryBuilder('multicups')
      .where({ id: multicupId })
      .getOne();

    if (!multicup) {
      throw new NotFoundException(`Multicup with id = ${multicupId} not found`);
    }

    return {
      id: multicup.id,
      name: multicup.name,
      rounds: multicup.rounds,
    };
  }

  public async getAllActiveMulticups(): Promise<AdminActiveMulticupInterface[]> {
    const multicups: Multicup[] = await this.multicupsRepository
      .createQueryBuilder('multicups')
      .leftJoinAndSelect('multicups.cups', 'cups')
      .getMany();

    return multicups
      .filter((multicup: Multicup) => multicup.cups.length !== multicup.rounds)
      .map((multicup: Multicup) => ({
        multicupId: multicup.id,
        name: multicup.name,
      }));
  }

  public async addMulticup(accessToken: string | undefined, addOnlineCupDto: MulticupActionDto): Promise<void> {
    // const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);
    // if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
    //   throw new UnauthorizedException('Unauthorized to add cup without CUP_ORGANIZER role');
    // }
    // const startDatetime = moment(addOnlineCupDto.startTime).tz('Europe/Moscow').format();
    // const endDatetime = moment(addOnlineCupDto.startTime).tz('Europe/Moscow').add(3, 'hours').format();
    // const queryResult: InsertResult = await this.cupsRepository
    //   .createQueryBuilder()
    //   .insert()
    //   .into(Cup)
    //   .values([
    //     {
    //       full_name: addOnlineCupDto.fullName,
    //       short_name: addOnlineCupDto.shortName,
    //       youtube: null,
    //       twitch: null,
    //       current_round: 1,
    //       start_datetime: startDatetime,
    //       end_datetime: endDatetime,
    //       server1: addOnlineCupDto.server1,
    //       server2: addOnlineCupDto.server2,
    //       map1: null,
    //       map2: null,
    //       map3: null,
    //       map4: null,
    //       map5: null,
    //       physics: addOnlineCupDto.physics,
    //       type: CupTypes.ONLINE,
    //       map_weapons: '',
    //       map_author: '',
    //       map_pk3: '',
    //       map_size: '',
    //       archive_link: null,
    //       bonus_rating: 0,
    //       system: null,
    //       custom_map: null,
    //       custom_news: null,
    //       validation_archive_link: null,
    //       timer: false,
    //       rating_calculated: false,
    //       use_two_servers: addOnlineCupDto.useTwoServers,
    //       demos_validated: false,
    //       multicup: null,
    //     },
    //   ])
    //   .execute();
    // if (addOnlineCupDto.addNews) {
    //   const cupId: number = queryResult.identifiers[0].id;
    //   await this.newsRepository
    //     .createQueryBuilder()
    //     .insert()
    //     .into(News)
    //     .values([
    //       {
    //         header: `Анонс ${addOnlineCupDto.fullName}`,
    //         header_en: `Announcement: ${addOnlineCupDto.fullName}`,
    //         text: '',
    //         text_en: '',
    //         youtube: null,
    //         user: { id: userAccess.userId! },
    //         datetimezone: moment().tz('Europe/Moscow').format(),
    //         newsType: { id: mapNewsTypeEnumToDBNewsTypeId(NewsTypes.ONLINE_ANNOUNCE) },
    //         cup: { id: cupId },
    //         comments_count: 0,
    //         hide_on_main: false,
    //       },
    //     ])
    //     .execute();
    // }
  }

  public async updateMulticup(
    accessToken: string | undefined,
    updateMulticupDto: MulticupActionDto,
    cupId: number,
  ): Promise<void> {
    // const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);
    // if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
    //   throw new UnauthorizedException('Unauthorized to edit cup without CUP_ORGANIZER role');
    // }
    // const cup: Cup | null = await this.cupsRepository.createQueryBuilder('cups').where({ id: cupId }).getOne();
    // if (!cup) {
    //   throw new NotFoundException(`Cup with id = ${cupId} not found`);
    // }
    // if (moment().isAfter(moment(cup.end_datetime))) {
    //   throw new BadRequestException(`Can't update - cup already finished`);
    // }
    // const startDatetime = moment(updateOnlineCupDto.startTime).tz('Europe/Moscow').format();
    // const endDatetime = moment(updateOnlineCupDto.startTime).tz('Europe/Moscow').add(3, 'hours').format();
    // await this.cupsRepository
    //   .createQueryBuilder()
    //   .update(Cup)
    //   .set({
    //     full_name: updateOnlineCupDto.fullName,
    //     short_name: updateOnlineCupDto.shortName,
    //     start_datetime: startDatetime,
    //     end_datetime: endDatetime,
    //     use_two_servers: updateOnlineCupDto.useTwoServers,
    //     server1: updateOnlineCupDto.server1,
    //     server2: updateOnlineCupDto.server2,
    //     physics: updateOnlineCupDto.physics,
    //   })
    //   .where({ id: cupId })
    //   .execute();
    // if (updateOnlineCupDto.addNews) {
    //   await this.newsRepository
    //     .createQueryBuilder('news')
    //     .update(News)
    //     .set({
    //       header: `Анонс ${updateOnlineCupDto.fullName}`,
    //       header_en: `Announcement: ${updateOnlineCupDto.fullName}`,
    //       user: { id: userAccess.userId! },
    //     })
    //     .where({ cup: { id: cupId } })
    //     .andWhere({ newsType: { id: mapNewsTypeEnumToDBNewsTypeId(NewsTypes.ONLINE_ANNOUNCE) } })
    //     .execute();
    // }
  }

  public async deleteMulticup(accessToken: string | undefined, multicupId: number): Promise<void> {
    // const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);
    // if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
    //   throw new UnauthorizedException('Unauthorized to delete cup without CUP_ORGANIZER role');
    // }
    // const cup: Cup | null = await this.cupsRepository.createQueryBuilder('cups').where({ id: cupId }).getOne();
    // if (!cup) {
    //   throw new NotFoundException(`Cup with id = ${cupId} not found`);
    // }
    // if (moment().isAfter(moment(cup.end_datetime))) {
    //   throw new BadRequestException(`Can't delete - cup already finished`);
    // }
    // const newsIds: number[] = (
    //   await this.newsRepository
    //     .createQueryBuilder()
    //     .where({ cup: { id: cupId } })
    //     .getMany()
    // ).map((newsItem: News) => newsItem.id);
    // if (newsIds.length) {
    //   await this.newsCommentsRepository
    //     .createQueryBuilder('news_comments')
    //     .delete()
    //     .from(NewsComment)
    //     .where('"news_comments"."newsId" IN(:...ids)', { ids: newsIds })
    //     .execute();
    // }
    // await this.newsRepository
    //   .createQueryBuilder()
    //   .delete()
    //   .from(News)
    //   .where({ cup: { id: cupId } })
    //   .execute();
    // await this.cupsDemosRepository
    //   .createQueryBuilder()
    //   .delete()
    //   .from(CupDemo)
    //   .where({ cup: { id: cupId } })
    //   .execute();
    // await this.cupsResultsRepository
    //   .createQueryBuilder()
    //   .delete()
    //   .from(CupResult)
    //   .where({ cup: { id: cupId } })
    //   .execute();
    // await this.cupsRepository.createQueryBuilder().delete().from(Cup).where({ id: cupId }).execute();
  }
}
