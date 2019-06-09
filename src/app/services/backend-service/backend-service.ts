import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class BackendService {
    constructor(@Optional() private httpClient: HttpClient) {}

    public post$(url: string, postParams?: Record<string, string>): Observable<any> {
        return this.httpClient.post(url, this.prepareHttpParams(postParams), { withCredentials: true });
    }

    private prepareHttpParams(params?: Record<string, string>): HttpParams {
        let httpParams = new HttpParams();

        if (params) {
            Object.keys(params).forEach((key: string) => (httpParams = httpParams.set(key, params[key])));
        }

        return httpParams;
    }
}
