import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { appRoutes } from './routing/app.routing';
import { MainSiteModule } from './upper-routing-modules/main-site/main-site.module';
import { UserService } from './services/user-service/user.service';
import { CookieService } from 'ngx-cookie-service';
import { NewsService } from './services/news-service/news.service';
import { LanguageTranslationsModule } from './components/language-translations/language-translations.module';
import { GlobalServicesModule } from './modules/global-services.module';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        RouterModule.forRoot(appRoutes),
        MainSiteModule,
        LanguageTranslationsModule,
        GlobalServicesModule,
    ],
    bootstrap: [AppComponent],
    providers: [UserService, CookieService, NewsService],
})
export class AppModule {}
