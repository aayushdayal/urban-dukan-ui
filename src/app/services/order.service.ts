import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CartItem } from './cart.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, catchError } from 'rxjs/operators';

interface CreateOrderResponse {
  orderId: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private items: CartItem[] = [];
  private apiUrl = environment.api_base + '/orders';

  constructor(private http: HttpClient) {}

  setItems(items: CartItem[]) {
    this.items = items.map(i => ({ ...i }));
  }

  getItems(): CartItem[] {
    return this.items;
  }

  clear() {
    this.items = [];
  }

  // placeholder for real server call
  placeOrder(payload: { name: string; address: string; phone: string; items: CartItem[] }): Observable<{ success: boolean; orderId?: string }> {
    const items = payload.items || this.items;

    // If single item -> call buynow endpoint
    if (items.length === 1) {
      const body = { productId: items[0].product.id, quantity: items[0].quantity };
      return this.http.post<CreateOrderResponse>(`${this.apiUrl}/buynow`, body).pipe(
        map(res => ({ success: true, orderId: res.orderId })),
        catchError(() => of({ success: false }))
      );
    }

    // Multiple items -> create order from server-side cart
    return this.http.post<CreateOrderResponse>(`${this.apiUrl}`, null).pipe(
      map(res => ({ success: true, orderId: res.orderId })),
      catchError(() => of({ success: false }))
    );
  }
}