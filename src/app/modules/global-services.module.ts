import { NgModule } from '@angular/core';
import { LanguageService } from '../services/language/language.service';
import { UserService } from '../services/user-service/user.service';
import { CookieService } from 'ngx-cookie-service';
import { NewsService } from '../services/news-service/news.service';
import { BackendService } from '../services/backend-service/backend-service';

@NgModule({
    providers: [LanguageService, UserService, CookieService, NewsService, BackendService],
})
export class GlobalServicesModule {}
