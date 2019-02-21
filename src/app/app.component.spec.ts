import { TestBed, async, fakeAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { initialState } from './store/reducers/data.reducer';
import { Store } from '@ngrx/store';
import { RouterModule, Router } from '@angular/router';

describe('AppComponent', () => {
    let mockStore: MockStore<{ count: number }>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule],
            declarations: [AppComponent],
            providers: [
                provideMockStore({
                    initialState
                }),
                Router,
            ]
        }).compileComponents();

        mockStore = TestBed.get(Store);
    }));

    it('should create the app', fakeAsync(() => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));
});
