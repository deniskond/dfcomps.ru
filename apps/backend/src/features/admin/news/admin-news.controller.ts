import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AdminNewsService } from './admin-news.service';
import { AdminEditNewsInterface, AdminNewsListInterface, AdminNewsDto } from '@dfcomps/contracts';

@Controller('admin/news')
export class AdminNewsController {
  constructor(private readonly adminNewsService: AdminNewsService) {}

  @Get('get-all-news')
  getAllNews(@Headers('X-Auth') accessToken: string | undefined): Promise<AdminNewsListInterface[]> {
    return this.adminNewsService.getAllNews(accessToken);
  }

  @Get('get/:newsId')
  getSingleNews(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('newsId', new ParseIntPipe()) newsId: number,
  ): Promise<AdminEditNewsInterface> {
    return this.adminNewsService.getSingleNews(accessToken, newsId);
  }

  @Post('delete/:newsId')
  deleteNews(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('newsId', new ParseIntPipe()) newsId: number,
  ): Promise<void> {
    return this.adminNewsService.deleteNews(accessToken, newsId);
  }

  @Post('post')
  postNews(@Headers('X-Auth') accessToken: string | undefined, @Body() AdminNewsDto: AdminNewsDto): Promise<void> {
    return this.adminNewsService.postNews(accessToken, AdminNewsDto);
  }

  @Post('update/:newsId')
  updateNews(
    @Headers('X-Auth') accessToken: string | undefined,
    @Body() AdminNewsDto: AdminNewsDto,
    @Param('newsId', new ParseIntPipe()) newsId: number,
  ): Promise<void> {
    return this.adminNewsService.updateNews(accessToken, AdminNewsDto, newsId);
  }
}
