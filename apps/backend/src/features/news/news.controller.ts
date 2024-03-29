import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post } from '@nestjs/common';
import { NewsService } from './news.service';
import { ArchiveNewsResultInterface, NewsArchiveFilterDto, NewsInterfaceUnion } from '@dfcomps/contracts';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('mainpage')
  getAllMainPageNews(@Headers('X-Auth') accessToken: string): Promise<NewsInterfaceUnion[]> {
    return this.newsService.getAllMainPageNews(accessToken);
  }

  @Get('single/:id')
  getSingleNews(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('id', new ParseIntPipe()) newsId: number,
  ): Promise<NewsInterfaceUnion> {
    return this.newsService.getSingleNews(accessToken, newsId);
  }

  @Get('theme/:theme')
  getThemeNews(
    @Headers('X-Auth') accessToken: string | undefined,
    @Param('theme') theme: string,
  ): Promise<NewsInterfaceUnion[]> {
    return this.newsService.getThemeNews(accessToken, theme);
  }

  @Post('archive')
  getNewsArchive(@Body() { startIndex, endIndex, filter }: NewsArchiveFilterDto): Promise<ArchiveNewsResultInterface> {
    return this.newsService.getNewsArchive(startIndex, endIndex, filter);
  }
}
