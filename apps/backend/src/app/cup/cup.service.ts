import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cup } from './entities/cup.entity';
import { CupInterface } from '@dfcomps/contracts';

@Injectable()
export class CupService {
  constructor(@InjectRepository(Cup) private readonly cupRepository: Repository<Cup>) {}

  getNextCupInfo(): Promise<CupInterface> {
    return {} as any;
  }
}
