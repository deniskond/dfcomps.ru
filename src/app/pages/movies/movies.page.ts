import { LanguageService } from '../../services/language/language.service';
import { Translations } from '../../components/translations/translations.component';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MoviesService } from './services/movies.service';
import { MovieInterface } from './interfaces/movie.interface';
import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { shuffle } from 'lodash';

@Component({
    templateUrl: './movies.page.html',
    styleUrls: ['./movies.page.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoviesPageComponent extends Translations implements OnInit {
    public movies$: Observable<MovieInterface[]>;

    constructor(private moviesService: MoviesService, private sanitizer: DomSanitizer, protected languageService: LanguageService) {
        super(languageService);
    }

    ngOnInit(): void {
        this.moviesService.loadMoviesIfNeeded();
        this.movies$ = this.moviesService.getMovies$().pipe(map((movies: MovieInterface[]) => shuffle(movies)));
        super.ngOnInit();
    }

    public getAuthorName(name: string): string {
        return name.length > 23 ? `${name.substring(0, 23)}...` : name;
    }

    public getMovieBgStyle(youtubeId: string): Record<string, string> {
        const imageUrl = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

        this.sanitizer.bypassSecurityTrustResourceUrl(imageUrl);

        return {
            background: `url('${imageUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'left',
        };
    }
}
