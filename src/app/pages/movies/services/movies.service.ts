import { BackendService } from '../../../services/backend-service/backend-service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_PARAMS } from '../../../configs/url-params.config';
import { MovieInterface } from '../interfaces/movie.interface';

@Injectable()
export class MoviesService extends BackendService {
    public getMovies$(): Observable<MovieInterface[]> {
       return this.get$(URL_PARAMS.MOVIES);
    }
}
