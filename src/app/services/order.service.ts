import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CartItem } from './cart.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private items: CartItem[] = [];

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
    // replace with HttpClient.post(...) when backend endpoint is available
    const orderId = 'ORD' + Math.floor(Math.random() * 900000 + 100000);
    return of({ success: true, orderId });
  }
}