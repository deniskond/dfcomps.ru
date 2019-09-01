import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { appRoutes } from './routing/app.routing';
import { GlobalServicesModule } from './modules/global-services.module';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        RouterModule.forRoot(appRoutes),
        GlobalServicesModule,
        HttpClientModule,
        BrowserAnimationsModule,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
