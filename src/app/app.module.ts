import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { appRoutes } from './routing/app.routing';
import { MainSiteModule } from './upper-routing-modules/main-site/main-site.module';
import { UserService } from './services/user-service/user.service';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        RouterModule.forRoot(appRoutes),
        MainSiteModule,
    ],
    bootstrap: [AppComponent],
    providers: [UserService],
})
export class AppModule {}
