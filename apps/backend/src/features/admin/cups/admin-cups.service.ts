import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { AdminCupDto } from '@dfcomps/contracts';

@Injectable()
export class AdminCupsService {
  constructor(private readonly authService: AuthService) {}

  public async getAllCups(accessToken: string | undefined): Promise<any> {
    return {};
  }

  public async getSingleCup(accessToken: string | undefined, cupId: number): Promise<any> {
    return {};
  }

  public async deleteCup(accessToken: string | undefined, cupId: number): Promise<void> {}

  public async addCup(accessToken: string | undefined, cupDto: AdminCupDto): Promise<void> {}

  public async updateCup(accessToken: string | undefined, cupDto: AdminCupDto, cupId: number): Promise<void> {}
}
