import { BackendService, URL_PARAMS } from '@frontend/shared/rest-api';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, filter } from 'rxjs';
import { MovieInterface } from '../interfaces/movie.interface';
import { isNonNull } from '../../../../shared/helpers';

@Injectable()
export class MoviesService extends BackendService {
  private _movies$ = new BehaviorSubject<MovieInterface[] | null>(null);

  public loadMoviesIfNeeded(): void {
    if (!this._movies$.value) {
      this.post$<MovieInterface[]>(URL_PARAMS.MOVIES).subscribe((movies: MovieInterface[]) =>
        this._movies$.next(movies),
      );
    }
  }

  public getMovies$(): Observable<MovieInterface[]> {
    return this._movies$.asObservable().pipe(filter(isNonNull));
  }
}
