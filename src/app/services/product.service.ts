import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductsResponse } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = environment.api_base + '/api/products';
  constructor(private http: HttpClient) {}

  getProducts(limit: number, skip: number): Observable<ProductsResponse> {
    //   this.apiUrl = 'https://localhost:7019/api/Products';
    return this.http.get<ProductsResponse>(`${this.apiUrl}?limit=${limit}&skip=${skip}`);
  }

  getProductById(id: number): Observable<Product> {
  return this.http.get<Product>(`${this.apiUrl}/${id}`);
}
}