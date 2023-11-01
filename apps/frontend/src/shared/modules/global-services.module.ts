import { NgModule } from '@angular/core';
import { LanguageService } from '../services/language/language.service';
import { UserService } from '../services/user-service/user.service';
import { NewsService } from '../services/news-service/news.service';
import { BackendService } from '~shared/rest-api';

@NgModule({
  providers: [LanguageService, UserService, NewsService, BackendService],
})
export class GlobalServicesModule {}
