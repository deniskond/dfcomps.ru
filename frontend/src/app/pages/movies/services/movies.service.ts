import { BackendService } from '../../../services/backend-service/backend-service';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { URL_PARAMS } from '../../../configs/url-params.config';
import { MovieInterface } from '../interfaces/movie.interface';

@Injectable()
export class MoviesService extends BackendService {
    private _movies$ = new BehaviorSubject<MovieInterface[]>(null);

    public loadMoviesIfNeeded(): void {
        if (!this._movies$.value) {
            this.post$(URL_PARAMS.MOVIES).subscribe((movies: MovieInterface[]) => this._movies$.next(movies));
        }
    }

    public getMovies$(): Observable<MovieInterface[]> {
       return this._movies$.asObservable();
    }
}
