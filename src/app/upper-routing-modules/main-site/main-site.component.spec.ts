import { UserService } from '../../services/user-service/user.service';
import { initialState } from '../../store/reducers/data.reducer';
import { TestBed, async, fakeAsync } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Store } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';
import { MainSiteComponent } from './main-site.component';
import { MainSiteModule } from './main-site.module';
import { instance, mock } from 'ts-mockito';

describe('MainSiteComponent', () => {
    let mockStore: MockStore<{ count: number }>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, MainSiteModule],
            providers: [
                provideMockStore({
                    initialState,
                }),
                { provide: UserService, useFactory: () => instance(mock(UserService)) },
            ],
        }).compileComponents();

        mockStore = TestBed.get(Store);
    }));

    it('should create the app', fakeAsync(() => {
        const fixture = TestBed.createComponent(MainSiteComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));
});
