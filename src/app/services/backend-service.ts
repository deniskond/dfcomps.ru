import { HttpClient } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { Observable } from 'rxjs';

const ACCESS_CONTROL_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

@Injectable({
    providedIn: 'root'
})
export class BackendService {
    constructor(@Optional() private httpClient: HttpClient) {}

    public get(url: string, params?: Record<string, string>): Observable<any> {
        return this.httpClient.get(url, {
            headers: ACCESS_CONTROL_HEADERS,
            params,
        });
    }

    public post(url: string, params?: Record<string, string>): Observable<any> {
        return this.httpClient.post(url, {
            headers: ACCESS_CONTROL_HEADERS,
            params,
        });
    }
}
