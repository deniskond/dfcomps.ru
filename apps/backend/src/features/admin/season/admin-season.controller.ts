import { Controller, Post, Headers } from '@nestjs/common';
import { AdminSeasonService } from './admin-season.service';

@Controller('admin/season')
export class AdminSeasonController {
  constructor(private adminSeasonService: AdminSeasonService) {}

  @Post('save-ratings')
  async saveSeasonRatings(@Headers('X-Auth') accessToken: string | undefined): Promise<void> {
    return this.adminSeasonService.saveSeasonRatings(accessToken);
  }

  @Post('set-rewards')
  async setSeasonRewards(@Headers('X-Auth') accessToken: string | undefined): Promise<void> {
    return this.adminSeasonService.setSeasonRewards(accessToken);
  }

  @Post('reset-ratings')
  async resetRatings(@Headers('X-Auth') accessToken: string | undefined): Promise<void> {
    return this.adminSeasonService.resetRatings(accessToken);
  }

  @Post('increment')
  async incrementSeason(@Headers('X-Auth') accessToken: string | undefined): Promise<void> {
    return this.adminSeasonService.incrementSeason(accessToken);
  }
}
