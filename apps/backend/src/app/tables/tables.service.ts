import { LeaderTableInterface, Physics, RatingTablesModes } from '@dfcomps/contracts';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';
import { OneVOneRating } from './entities/1v1-rating.entity';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(OneVOneRating) private readonly oneVOneRatingRepository: Repository<OneVOneRating>,
  ) {}

  async getTop10(physics: Physics, mode: RatingTablesModes): Promise<LeaderTableInterface[]> {
    if (mode === RatingTablesModes.CLASSIC) {
      const top10Users: User[] = await this.userRepository
        .createQueryBuilder()
        .orderBy(`${physics}_rating`, 'DESC')
        .limit(10)
        .getMany();

      return top10Users.map(({ displayed_nick, cpm_rating, vq3_rating, id, country }: User) => ({
        playerId: id,
        nick: displayed_nick,
        country,
        rating: physics === Physics.CPM ? cpm_rating : vq3_rating,
      }));
    }

    const top10Users: OneVOneRating[] = await this.oneVOneRatingRepository
      .createQueryBuilder('1v1_rating')
      .innerJoinAndSelect('1v1_rating.user', 'user')
      .orderBy(`${physics}`, 'DESC')
      .limit(10)
      .getMany();

    return top10Users.map((result) => ({
      playerId: result.user.id,
      nick: result.user.displayed_nick,
      country: result.user.country,
      rating: physics === Physics.CPM ? result.cpm : result.vq3,
    }));
  }
}
