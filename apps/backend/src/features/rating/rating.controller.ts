import { SeasonNumberInterface } from '@dfcomps/contracts';
import { Controller, Get } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Season } from '../../shared/entities/season.entity';

@Controller('rating')
export class RatingController {
  constructor(@InjectRepository(Season) private readonly seasonRepository: Repository<Season>) {}

  @Get('get_season')
  async getSeason(): Promise<SeasonNumberInterface> {
    const { season }: Season = (await this.seasonRepository.createQueryBuilder('season').getOne())!;

    return {
      season,
    };
  }
}
