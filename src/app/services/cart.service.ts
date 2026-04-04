import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Product, ProductsResponse } from '../models/product.model';
import { ProductService } from './product.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

/** Server DTO shapes (mirror CartDtos.cs) */
interface CartItemDto {
  productId: number;
  quantity: number;
}
interface CartResponse {
  userId: number;
  items: CartItemDto[];
}
interface AddCartItemRequest {
  productId: number;
  quantity: number;
}
interface UpdateCartItemRequest {
  productId: number;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private cart: CartItem[] = [];
  private apiUrl = environment.api_base + '/cart';

  constructor(private http: HttpClient, private auth: AuthService, private productService: ProductService) {
    // keep as before: attempt sync when user is logged in
    if (this.auth.isLoggedIn()) {
      this.syncWithServer().subscribe({ next: () => {}, error: () => {} });
    }
  }

  // Local behavior kept for offline / anonymous usage
  addToCart(product: Product, quantity: number = 1) {
    const existing = this.cart.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({ product, quantity });
    }

    // Persist change to server when logged in (use DTO shape)
    if (this.auth.isLoggedIn()) {
      const payload: AddCartItemRequest = { productId: product.id, quantity };
      this.http.post<void>(`${this.apiUrl}/items`, payload)
        .pipe(catchError(() => of(null)))
        .subscribe({ next: () => this.syncWithServer().subscribe({ next: () => {}, error: () => {} }), error: () => {} });
    }
  }

  getCart(): CartItem[] {
    return this.cart;
  }

  // Force refresh from backend and update local cache.
  // The backend returns CartResponse with items as { productId, quantity }.
  // We fetch product details for each productId so UI retains full Product objects.
  syncWithServer(): Observable<CartItem[] | null> {
    if (!this.auth.isLoggedIn()) {
      return of(null);
    }

    return this.http.get<CartResponse>(this.apiUrl).pipe(
      switchMap(resp => {
        const dtos = resp?.items || [];
        if (!dtos.length) {
          this.cart = [];
          return of(this.cart);
        }

        // fetch product details for all productIds
        const obs = dtos.map(d =>
          this.productService.getProductById(d.productId).pipe(
            map(prod => ({ product: prod, quantity: d.quantity })),
            catchError(() => {
              // If a product fetch fails, create a minimal placeholder so UI doesn't crash
              const placeholder: Product = {
                id: d.productId,
                title: 'Product',
                description: '',
                price: 0,
                discountPercentage: 0,
                rating: 0,
                stock: 0,
                brand: null,
                category: '',
                thumbnail: '',
                images: []
              };
              return of({ product: placeholder, quantity: d.quantity });
            })
          )
        );

        return forkJoin(obs).pipe(
          map(items => {
            this.cart = items;
            return this.cart;
          })
        );
      }),
      catchError(err => {
        console.error('[CartService] syncWithServer failed', err);
        return of(null);
      })
    );
  }

  // Update a single item's quantity locally and on backend
  updateItem(productId: number, quantity: number): Observable<any> {
    // update local cache
    const existing = this.cart.find(i => i.product.id === productId);
    if (existing) {
      existing.quantity = quantity;
    }

    if (!this.auth.isLoggedIn()) {
      return of(null);
    }

    const payload: UpdateCartItemRequest = { productId, quantity };
    return this.http.put<void>(`${this.apiUrl}/items`, payload).pipe(
      catchError(err => {
        console.error('[CartService] updateItem failed', err);
        return of(null);
      })
    );
  }

  // Remove an item locally and on backend
  removeItem(productId: number): Observable<any> {
    this.cart = this.cart.filter(i => i.product.id !== productId);

    if (!this.auth.isLoggedIn()) {
      return of(null);
    }

    return this.http.delete<void>(`${this.apiUrl}/items/${productId}`).pipe(
      catchError(err => {
        console.error('[CartService] removeItem failed', err);
        return of(null);
      })
    );
  }

  // Clear local cart and remote cart
  clearCart() {
    this.cart = [];

    if (this.auth.isLoggedIn()) {
      this.http.delete<void>(this.apiUrl).pipe(catchError(() => of(null))).subscribe();
    }
  }
}