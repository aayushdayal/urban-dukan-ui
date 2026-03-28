import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
    constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  private TOKEN_KEY = 'token';
  private EMAIL_KEY = 'email';
  private USERID_KEY = 'userId';

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserEmail(): string | null {
    return localStorage.getItem(this.EMAIL_KEY);
  }

  getUserId(): string | null {
    return localStorage.getItem(this.USERID_KEY);
  }

  setSession(token: string, email: string, userId: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.EMAIL_KEY, email);
    localStorage.setItem(this.USERID_KEY, userId);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EMAIL_KEY);
    localStorage.removeItem(this.USERID_KEY);
  }
}