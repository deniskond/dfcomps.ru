import { Injectable } from '@angular/core';
import { BackendService } from '../backend-service/backend-service';
import { URL_PARAMS } from '../../configs/url-params.config';
import { Observable, BehaviorSubject } from 'rxjs';
import { PersonalSmileInterface } from './personal-smile.interface';
import { tap, filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SmilesService extends BackendService {
    private personalSmiles$ = new BehaviorSubject<PersonalSmileInterface[] | null>(null);
    private isLoading = false;

    public getPersonalSmiles$(): Observable<PersonalSmileInterface[]> {
        return this.personalSmiles$.pipe(
            tap((personalSmiles: PersonalSmileInterface[]) => {
                if (!personalSmiles && !this.isLoading) {
                    this.isLoading = true;
                    this.fetchPersonalSmiles();
                }
            }),
            filter(smiles => !!smiles),
        );
    }

    private fetchPersonalSmiles(): void {
        this.post$(URL_PARAMS.SMILES.GET_PERSONAL_SMILES).subscribe((personalSmiles: PersonalSmileInterface[]) => {
            this.personalSmiles$.next(personalSmiles);
            this.isLoading = false;
        });
    }
}
