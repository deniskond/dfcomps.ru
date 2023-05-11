import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { GlobalServicesModule } from '~shared/modules/global-services.module';
import { ReflexComponent } from '~shared/pages/reflex/reflex.component';
import { appRoutes } from '../routing/app.routing';

@NgModule({
  declarations: [AppComponent, ReflexComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' }),
    GlobalServicesModule,
    HttpClientModule,
    BrowserAnimationsModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
