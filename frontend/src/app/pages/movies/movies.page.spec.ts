import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MoviesPageComponent } from './movies.page';
import { MoviesPageModule } from './movies.page.module';
import { MoviesService } from './services/movies.service';
import { instance, mock, when } from 'ts-mockito';
import { of } from 'rxjs';

describe('MoviesPageComponent', () => {
    let component: MoviesPageComponent;
    let fixture: ComponentFixture<MoviesPageComponent>;
    const moviesServiceMock = mock(MoviesService);

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MoviesPageModule],
            providers: [{ provide: MoviesService, useFactory: () => instance(moviesServiceMock) }],
        }).compileComponents();

        when(moviesServiceMock.getMovies$()).thenReturn(of([]));
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MoviesPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
