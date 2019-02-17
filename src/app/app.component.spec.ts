import { TestBed, async, fakeAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { initialState } from './store/reducers/data.reducer';
import { Store, select } from '@ngrx/store';
import { when } from 'ts-mockito';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let mockStore: MockStore<{ count: number }>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
      ],
      providers: [
        provideMockStore({
          initialState: initialState,
        }),
      ]
    }).compileComponents();

    mockStore = TestBed.get(Store);

    when(mockStore.pipe(select('count'))).thenReturn(of(2));
  }));

  it('should create the app', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;

    // mockStore.setState({ count: 2 });

    expect(app).toBeTruthy();

    // mockStore.pipe(select('count'), take(1)).subscribe((count: number) => {
    //   expect(count).toBe(2);
    // });
  }));

});
