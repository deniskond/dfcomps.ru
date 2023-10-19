import { Controller, Get, Headers, Param, ParseIntPipe } from '@nestjs/common';
import { NewsService } from './news.service';
import { ArchiveNewsInterface, NewsInterfaceUnion, PaginationCountInterface } from '@dfcomps/contracts';

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
  getThemeNews(@Headers('X-Auth') accessToken: string | undefined, @Param('theme') theme: string): Promise<NewsInterfaceUnion[]> {
    return this.newsService.getThemeNews(accessToken, theme);
  }

  @Get('count')
  getNewsCount(): Promise<PaginationCountInterface> {
    return this.newsService.getNewsCount();
  }

  @Get('archive/:startIndex/:endIndex')
  getNewsArchive(
    @Param('startIndex', new ParseIntPipe()) startIndex: number,
    @Param('endIndex', new ParseIntPipe()) endIndex: number,
  ): Promise<ArchiveNewsInterface[]> {
    return this.newsService.getNewsArchive(startIndex, endIndex);
  }
}
