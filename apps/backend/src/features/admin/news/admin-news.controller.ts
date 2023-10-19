import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AdminNewsService } from './admin-news.service';
import { AdminNewsInterface, PostNewsDto } from '@dfcomps/contracts';

@Controller('admin/news')
export class AdminNewsController {
  constructor(private readonly adminNewsService: AdminNewsService) {}

  @Get('get-all-news')
  getAllNews(@Headers('X-Auth') accessToken: string | undefined): Promise<AdminNewsInterface[]> {
    return this.adminNewsService.getAllNews(accessToken);
  }

  @Post('post')
  postNews(@Headers('X-Auth') accessToken: string | undefined, @Body() postNewsDto: PostNewsDto): Promise<void> {
    return this.adminNewsService.postNews(accessToken, postNewsDto);
  }
}
