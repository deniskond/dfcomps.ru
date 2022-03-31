import { Injectable } from '@angular/core';
import { BackendService } from '../backend-service/backend-service';
import { URL_PARAMS } from '../../configs/url-params.config';
import { Observable, BehaviorSubject } from 'rxjs';
import { PersonalSmileInterface } from './personal-smile.interface';
import { tap, filter } from 'rxjs/operators';
import { isNonNull } from '../../../shared/helpers';

@Injectable({
  providedIn: 'root',
})
export class SmilesService extends BackendService {
  private personalSmiles$ = new BehaviorSubject<PersonalSmileInterface[] | null>(null);
  private isLoading = false;

  public getPersonalSmiles$(): Observable<PersonalSmileInterface[]> {
    return this.personalSmiles$.pipe(
      tap((personalSmiles: PersonalSmileInterface[] | null) => {
        if (!personalSmiles && !this.isLoading) {
          this.isLoading = true;
          this.fetchPersonalSmiles();
        }
      }),
      filter(isNonNull),
    );
  }

  private fetchPersonalSmiles(): void {
    this.post$<PersonalSmileInterface[]>(URL_PARAMS.SMILES.GET_PERSONAL_SMILES).subscribe(
      (personalSmiles: PersonalSmileInterface[]) => {
        this.personalSmiles$.next(personalSmiles);
        this.isLoading = false;
      },
    );
  }
}
