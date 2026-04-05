import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private base = environment.api_base;

  constructor(private http: HttpClient) {}

  autocomplete(query: string): Observable<string[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<string[]>(`${this.base}/search/autocomplete`, { params });
  }

  search(query: string): Observable<any> {
    const params = new HttpParams().set('q', query);
    return this.http.get<any>(`${this.base}/search`, { params });
  }
}