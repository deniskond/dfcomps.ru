import { NickChangeResponseInterface, ProfileInterface } from '@dfcomps/contracts';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProfileService {
  constructor() {}

  public async getPlayerProfile(playerId: number): Promise<ProfileInterface> {
    return {} as any;
  }

  public async checkLastNickChangeTime(accessToken: string): Promise<NickChangeResponseInterface> {
    return {} as any;
  }

  public async updateProfile(
    accessToken: string,
    nick: string,
    country: string | undefined,
    avatar: Express.Multer.File,
  ): Promise<void> {
    return {} as any;
  }
}
