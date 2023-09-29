import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '~shared/services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  constructor(
    protected httpClient: HttpClient,
    private authService: AuthService,
  ) {}

  public get$<T>(url: string): Observable<T> {
    return this.httpClient.get<T>(url, this.getCustomHeaders());
  }

  public post$<T>(url: string, postParams?: Record<string, string>): Observable<T> {
    return this.httpClient.post<T>(url, this.prepareHttpParams(postParams), this.getCustomHeaders());
  }

  public uploadFile$(
    url: string,
    fileKeyValues: { fileKey: string; file: any }[],
    postParams?: Record<string, string>,
  ): Observable<any> {
    const formData: FormData = new FormData();

    fileKeyValues.forEach(({ fileKey, file }) => {
      if (file) {
        formData.append(fileKey, file, file.name);
      }
    });

    if (postParams) {
      Object.keys(postParams).forEach((key: string) => formData.append(key, postParams[key]));
    }

    return this.httpClient.post(url, formData, { withCredentials: true });
  }

  private prepareHttpParams(params?: Record<string, string>): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key: string) => (httpParams = httpParams.set(key, params[key])));
    }

    return httpParams;
  }

  private getCustomHeaders(): { headers: Record<string, string> } {
    const accessToken: string | null = this.authService.getToken();

    return { headers: accessToken ? { 'X-Auth': accessToken } : {} };
  }
}
