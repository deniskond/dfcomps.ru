import { UploadDemoResponseInterface } from '@dfcomps/contracts';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DemosService {
  constructor() {}

  public async upload(accessToken: string, demo: Express.Multer.File): Promise<UploadDemoResponseInterface> {
    return {} as any;
  }
}
