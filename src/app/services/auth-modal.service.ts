import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AuthModalType = 'login' | 'signup' | null;

@Injectable({ providedIn: 'root' })
export class AuthModalService {
  private _open$ = new BehaviorSubject<AuthModalType>(null);
  open$ = this._open$.asObservable();

  // optional return URL to redirect after login/signup
  public returnUrl?: string;

  openLogin(returnUrl?: string) {
    this.returnUrl = returnUrl;
    this._open$.next('login');
  }

  openSignup(returnUrl?: string) {
    this.returnUrl = returnUrl;
    this._open$.next('signup');
  }

  close() {
    this.returnUrl = undefined;
    this._open$.next(null);
  }
}