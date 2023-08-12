import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { GlobalServicesModule } from '~shared/modules/global-services.module';
import { appRoutes } from '../routing/app.routing';
import { ReflexComponent } from '~pages/reflex/reflex.component';

@NgModule({
  declarations: [AppComponent, ReflexComponent],
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
