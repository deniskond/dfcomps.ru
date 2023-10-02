import { LeaderTableInterface, Physics } from '@dfcomps/contracts';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TablesService {
  constructor() {}

  getTop10(physics: Physics, mode: '1v1' | 'classic'): Promise<LeaderTableInterface[]> {
    return Promise.resolve([
      {
        playerId: 82,
        nick: 'ket.',
        country: 'hu',
        rating: 2064,
      },
      {
        playerId: 192,
        nick: 'effect',
        country: 'ru',
        rating: '2019',
      },
      {
        playerId: 504,
        nick: '<acc/Shihua',
        country: 'af',
        rating: '1927',
      },
      {
        playerId: 437,
        nick: 'tofu',
        country: 'us',
        rating: '1899',
      },
      {
        playerId: 93,
        nick: '[fps]Proky',
        country: 'ru',
        rating: '1889',
      },
      {
        playerId: 763,
        nick: 'Mikendo',
        country: 'de',
        rating: '1864',
      },
      {
        playerId: 533,
        nick: 'Zeppelin',
        country: 'us',
        rating: '1840',
      },
      {
        playerId: 575,
        nick: 'Anselmo',
        country: 'pl',
        rating: '1837',
      },
      {
        playerId: 415,
        nick: 'Arent',
        country: 'ru',
        rating: '1822',
      },
      {
        playerId: 282,
        nick: 'RunX',
        country: 'ru',
        rating: '1816',
      },
    ]) as any;
  }
}
