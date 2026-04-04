import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { AuthModalService } from '../services/auth-modal.service';
import { OrderService } from '../services/order.service';

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
    private router: Router,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef // added
  ) {}

  ngOnInit() {
    // If logged in try to sync from server and then load local cache
    if (this.auth.isLoggedIn()) {
      this.cartService.syncWithServer().subscribe({
        next: () => this.load(),
        error: () => this.load()
      });
    } else {
      this.load();
    }
  }

  load() {
    this.items = this.cartService.getCart();
    // ensure view updates immediately when async sync completes
    try { this.cdr.detectChanges(); } catch { /* noop in case not needed */ }
  }

  inc(item: CartItem) {
    item.quantity++;
    try { this.cdr.detectChanges(); } catch {}
  }

  dec(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--;
      try { this.cdr.detectChanges(); } catch {}
    }
  }

  remove(item: CartItem) {
    if (this.auth.isLoggedIn()) {
      this.cartService.removeItem(item.product.id).subscribe({
        next: () => this.load(),
        error: () => this.load()
      });
    } else {
      this.items = this.items.filter(i => i !== item);
      (this.cartService as any).cart = this.items;
      this.message = 'Removed item';
      try { this.cdr.detectChanges(); } catch {}
      setTimeout(() => {
        this.message = '';
        try { this.cdr.detectChanges(); } catch {}
      }, 1600);
    }
  }

  updateCart() {
    if (this.auth.isLoggedIn()) {
      const ops = this.items.map(it => this.cartService.updateItem(it.product.id, it.quantity));
      let remaining = ops.length;
      if (!remaining) {
        this.message = 'Cart updated';
        try { this.cdr.detectChanges(); } catch {}
        setTimeout(() => { this.message = ''; try { this.cdr.detectChanges(); } catch {} }, 1600);
        return;
      }
      ops.forEach(obs =>
        obs.subscribe({
          next: () => {
            remaining--;
            if (remaining === 0) {
              this.cartService.syncWithServer().subscribe({ next: () => this.load(), error: () => this.load() });
              this.message = 'Cart updated';
              try { this.cdr.detectChanges(); } catch {}
              setTimeout(() => { this.message = ''; try { this.cdr.detectChanges(); } catch {} }, 1600);
            }
          },
          error: () => {
            remaining--;
            if (remaining === 0) {
              this.cartService.syncWithServer().subscribe({ next: () => this.load(), error: () => this.load() });
              this.message = 'Cart updated';
              try { this.cdr.detectChanges(); } catch {}
              setTimeout(() => { this.message = ''; try { this.cdr.detectChanges(); } catch {} }, 1600);
            }
          }
        })
      );
    } else {
      this.message = 'Cart updated';
      try { this.cdr.detectChanges(); } catch {}
      setTimeout(() => { this.message = ''; try { this.cdr.detectChanges(); } catch {} }, 1600);
    }
  }

  buyNow() {
    if (!this.auth.isLoggedIn()) {
      this.authModal.openLogin(this.router.url);
      return;
    }
    if (!this.items.length) {
      this.message = 'Cart is empty';
      try { this.cdr.detectChanges(); } catch {}
      setTimeout(() => { this.message = ''; try { this.cdr.detectChanges(); } catch {} }, 1600);
      return;
    }

    this.orderService.setItems(this.items);
    this.router.navigate(['/place-order']);
  }

  getTotal() {
    return this.items.reduce((s, it) => s + it.product.price * it.quantity, 0);
  }

  closeCart() {
    this.router.navigate(['/products']);
  }
}