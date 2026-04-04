import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CartItem } from './cart.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, catchError } from 'rxjs/operators';
import { map as rxMap } from 'rxjs/operators'; 

interface CreateOrderResponse {
  orderId: string;
}

// Minimal order shapes (adjust to DTOs returned by server)
export interface OrderSummary {
  orderId: string;
  createdAt: string;
  totalAmount: number;
  status: string;
}

// include optional UI fields used by templates
export interface OrderItem {
  productId: number;
  // product info (optional — may be filled by server or fetched client-side)
  title?: string;
  thumbnail?: string;
  quantity: number;
  unitPrice: number;
  // optional computed/returned total for the line
  totalPrice?: number;
}

export interface OrderDetail {
  orderId: string;
  createdAt: string;
  // status removed per earlier request (if present on backend map it elsewhere)
  totalAmount: number;
  items: OrderItem[];
  shippingAddress?: string;
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

  getMyOrders(): Observable<OrderSummary[]> {
    return this.http.get<any[]>(`${this.apiUrl}/me`).pipe(
      rxMap(list => (list || []).map(it => ({
        orderId: it.orderId ?? it.OrderId ?? it.id ?? it.Id ?? '',
        createdAt: it.createdAt ?? it.CreatedAt ?? it.created ?? it.Created ?? null,
        totalAmount: it.totalAmount ?? it.TotalAmount ?? it.total ?? it.Total ?? 0,
        status: it.status ?? it.Status ?? 'Unknown'
      })))
    );
  }

  getOrderById(id: string): Observable<OrderDetail> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      rxMap(it => ({
        orderId: it.orderId ?? it.OrderId ?? it.id ?? it.Id ?? '',
        createdAt: it.createdAt ?? it.CreatedAt ?? it.created ?? it.Created ?? null,
        status: it.status ?? it.Status ?? 'Unknown',
        totalAmount: it.totalAmount ?? it.TotalAmount ?? it.total ?? 0,
        shippingAddress: it.shippingAddress ?? it.ShippingAddress ?? it.address ?? it.Address ?? '',
        items: (it.items || []).map((x: any) => ({
          productId: x.productId ?? x.ProductId ?? x.productId ?? 0,
          title: x.title ?? x.Title ?? x.name ?? x.Name ?? undefined,
          quantity: x.quantity ?? x.Quantity ?? 0,
          unitPrice: x.unitPrice ?? x.UnitPrice ?? x.price ?? x.Price ?? 0,
          totalPrice: x.totalPrice ?? x.TotalPrice ?? undefined
        }))
      }))
    );
  }
}