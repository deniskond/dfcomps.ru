import { Injectable } from '@nestjs/common';
import { Season } from '../../shared/entities/season.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SeasonNumberInterface } from '@dfcomps/contracts';

@Injectable()
export class SeasonService {
  constructor(@InjectRepository(Season) private readonly seasonRepository: Repository<Season>) {}

  public async getSeason(): Promise<SeasonNumberInterface> {
    const { season }: Season = (await this.seasonRepository.createQueryBuilder('season').getOne())!;

    return {
      season,
    };
  }
}
