import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class BackendService {
    constructor(protected httpClient: HttpClient) {}

    public post$(url: string, postParams?: Record<string, string>): Observable<any> {
        return this.httpClient.post(url, this.prepareHttpParams(postParams), { withCredentials: true });
    }

    public uploadFile$(url: string, file: any, postParams?: Record<string, string>): Observable<any> {
        const formData: FormData = new FormData();
        
        formData.append('file', file, file.name);
        Object.keys(postParams).forEach((key: string) => formData.append(key, postParams[key]));

        return this.httpClient.post(url, formData, { withCredentials: true });
    }

    private prepareHttpParams(params?: Record<string, string>): HttpParams {
        let httpParams = new HttpParams();

        if (params) {
            Object.keys(params).forEach((key: string) => (httpParams = httpParams.set(key, params[key])));
        }

        return httpParams;
    }
}
