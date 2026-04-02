import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { AuthModalService } from '../services/auth-modal.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
  imports: [CommonModule, DecimalPipe]
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  message = '';

  constructor(
    private cartService: CartService,
    private auth: AuthService,
    private authModal: AuthModalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.items = this.cartService.getCart();
  }

  inc(item: CartItem) {
    item.quantity++;
  }

  dec(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--;
    }
  }

  remove(item: CartItem) {
    this.items = this.items.filter(i => i !== item);
    (this.cartService as any).cart = this.items;
    this.message = 'Removed item';
    setTimeout(() => this.message = '', 1600);
  }

  updateCart() {
    this.message = 'Cart updated';
    setTimeout(() => this.message = '', 1600);
  }

  buyNow() {
    if (!this.auth.isLoggedIn()) {
      this.authModal.openLogin(this.router.url);
      return;
    }
    if (!this.items.length) {
      this.message = 'Cart is empty';
      setTimeout(() => this.message = '', 1600);
      return;
    }
    this.router.navigate(['/checkout']);
  }

  getTotal() {
    return this.items.reduce((s, it) => s + (it.product.price * it.quantity), 0);
  }

  // ---------- Added: close button handler ----------
  closeCart() {
    // follow app navigation pattern: go back to products listing
    this.router.navigate(['/products']);
  }
}