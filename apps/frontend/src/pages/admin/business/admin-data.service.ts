import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_PARAMS } from '../../../app/configs/url-params.config';
import { BackendService } from '../../../app/services/backend-service/backend-service';

@Injectable({
  providedIn: 'root',
})
export class AdminDataService {
  constructor(private backendService: BackendService) {}

  public getAllNews$(): Observable<any> {
    return this.backendService.post$(URL_PARAMS.ADMIN.NEWS);
  }
}
