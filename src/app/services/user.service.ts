import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiErrorService } from './api-error.service';
import { User } from '../models/users.model';

export interface UserProfile {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
  roles?: string[];
}

// Add Update DTO used by frontend to match server UpdateUserRequest.cs
export interface UpdateUserRequest {
  firstName?: string | null;
  lastName?: string | null;
  address?: string | null;
  phone?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.api_base + '/auth';

  constructor(private http: HttpClient, private apiError: ApiErrorService) {}

  register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user)
    .pipe(catchError(this.apiError.handleError('Something went worng. Please try again')));
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials)
      .pipe(catchError(this.apiError.handleError('Something went worng. Please try again')));
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/userdetails`)
      .pipe(catchError(this.apiError.handleError('Failed to load profile.')));
  }

  // NEW: update logged user's profile -> calls AuthController PUT api/auth/userdetails
  updateProfile(payload: UpdateUserRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/userdetails`, payload)
      .pipe(catchError(this.apiError.handleError('Failed to update profile.')));
  }
}
