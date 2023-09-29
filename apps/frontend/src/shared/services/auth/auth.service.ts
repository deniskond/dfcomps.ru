import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accessToken: string | null;

  public setToken(accessToken: string | null): void {
    this.accessToken = accessToken;
  }

  public getToken(): string | null {
    return this.accessToken;
  }
}
