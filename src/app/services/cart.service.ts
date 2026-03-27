import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cart: Product[] = [];

  addToCart(product: Product) {
    this.cart.push(product);
    // Optionally persist to localStorage
  }

  getCart(): Product[] {
    return this.cart;
  }

  clearCart() {
    this.cart = [];
  }
}