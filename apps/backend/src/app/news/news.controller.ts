import { Controller, Get, Headers } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsInterfaceUnion } from '@dfcomps/contracts';
import { AuthService } from '../auth/auth.service';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    
  ) {}

  @Get('mainpage')
  allMainPageNews(@Headers('X-Auth') accessToken: string): Promise<NewsInterfaceUnion[]> {
    return this.newsService.getAllMainPageNews(accessToken);
  }
}
