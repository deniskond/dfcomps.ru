import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsComment } from './entities/news-comment.entity';
import { PersonalSmileInterface } from '@dfcomps/contracts';
import { Smile } from './entities/smile.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(NewsComment) private readonly newsCommentsRepository: Repository<NewsComment>,
    @InjectRepository(Smile) private readonly smilesRepository: Repository<Smile>,
  ) {}

  public async getPersonalSmiles(): Promise<PersonalSmileInterface[]> {
    const allSmiles: Smile[] = await this.smilesRepository
      .createQueryBuilder('smiles')
      .leftJoinAndSelect('smiles.user', 'users')
      .where('smiles.userId IS NOT NULL')
      .getMany();

    return allSmiles.map((smile: Smile) => ({
      playerId: smile.user?.id || null,
      smileAlias: smile.alias,
    }));
  }
}
