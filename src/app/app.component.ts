import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { BackendService } from './services/backend-service';
import { Decrement, Increment, Reset } from './store/actions/data.actions';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    public count$: Observable<number>;

    constructor(
        private store: Store<{ count: number }>,
        private backendService: BackendService
    ) {}

    public ngOnInit(): void {
        this.count$ = this.store.pipe(select('count'));
    }

    public increment(): void {
        this.store.dispatch(new Increment());
    }

    public decrement(): void {
        this.store.dispatch(new Decrement());
    }

    public reset(): void {
        this.store.dispatch(new Reset());
    }
}
