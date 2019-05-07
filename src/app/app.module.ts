import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { AppComponent } from './app.component';
import { counterReducer } from './store/reducers/data.reducer';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    MatButtonModule,
    MatDividerModule,
    MatTabsModule,
    MatButtonToggleModule,
    MatRippleModule,
} from '@angular/material';
import { appRoutes } from './routing/app.routing';
import { CupTimerModule } from './modules/cup-timer/cup-timer.module';
import { TopTenTableModule } from './modules/top-ten-table/top-ten-table.module';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        StoreModule.forRoot({ count: counterReducer }),
        HttpClientModule,
        RouterModule.forRoot(appRoutes),
        BrowserAnimationsModule,
        MatButtonModule,
        MatDividerModule,
        MatTabsModule,
        MatButtonToggleModule,
        MatRippleModule,
        CupTimerModule,
        TopTenTableModule,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
