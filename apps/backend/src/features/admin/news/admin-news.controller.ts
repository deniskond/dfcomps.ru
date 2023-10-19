import { Controller, Get, Headers } from '@nestjs/common';
import { AdminNewsService } from './admin-news.service';
import { AdminNewsInterface } from '@dfcomps/contracts';

@Controller('admin/news')
export class AdminNewsController {
  constructor(private readonly adminNewsService: AdminNewsService) {}

  @Get('get-all-news')
  getAllNews(@Headers('X-Auth') accessToken: string | undefined): Promise<AdminNewsInterface[]> {
    return this.adminNewsService.getAllNews(accessToken);
  }
}
