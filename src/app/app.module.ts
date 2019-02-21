import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { AppComponent } from './app.component';
import { counterReducer } from './store/reducers/data.reducer';
import { SharedModule } from './modules/shared.module';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routing';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        StoreModule.forRoot({ count: counterReducer }),
        HttpClientModule,
        SharedModule,
        RouterModule.forRoot(appRoutes)
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
