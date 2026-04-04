import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiErrorService {
  // Builds a user facing message. Note: uses the exact generic text requested.
  getMessage(error: any, fallback = 'Something went wrong. Please try again'): string {
    const parts: string[] = [fallback];

    if (!error) return parts.join(' ');

    if (error instanceof HttpErrorResponse) {
      const status = error.status;
      const statusText = error.statusText || '';
      const serverMsg =
        (error.error && (error.error.message || error.error.Message)) ||
        (typeof error.error === 'string' ? error.error : null) ||
        error.message ||
        null;

      if (serverMsg) parts.push('—', this.trimMessage(serverMsg));
      if (status) parts.push(`(Error ${status}${statusText ? `: ${statusText}` : ''})`);
      return parts.join(' ');
    }

    const serverMsg = error.message || error.error?.message || error?.toString();
    if (serverMsg) parts.push('—', this.trimMessage(serverMsg));
    return parts.join(' ');
  }

  // Returns an operator-style error handler that throws Error with formatted message
  handleError<T>(fallback = 'Something went wrong. Please try again') {
    return (error: any): Observable<never> => {
      const msg = this.getMessage(error, fallback);
      return throwError(() => new Error(msg));
    };
  }

  private trimMessage(m: string) {
    return (m || '').toString().trim();
  }
}