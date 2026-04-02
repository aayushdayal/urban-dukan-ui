import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../services/order.service';
import { CartItem } from '../services/cart.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-place-order',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './place-order.html',
  styleUrls: ['./place-order.scss']
})
export class PlaceOrderComponent implements OnInit {
  items: CartItem[] = [];
  name = '';
  address = '';
  phone = '';
  message = '';
  placing = false;
  orderId?: string;

  constructor(private order: OrderService, private router: Router) {}

  ngOnInit() {
    this.items = this.order.getItems() || [];
    if (!this.items.length) {
      // nothing to place — go back
      this.router.navigate(['/products']);
    }
    // try prefill from localStorage/profile later
  }

  close() {
    this.router.navigate(['/products']);
  }

  getTotal() {
    return this.items.reduce((s, it) => s + it.product.price * it.quantity, 0);
  }

  placeOrder() {
    if (!this.name.trim() || !this.address.trim()) {
      this.message = 'Please provide shipping name and address.';
      return;
    }
    this.placing = true;
    this.order.placeOrder({ name: this.name, address: this.address, phone: this.phone, items: this.items }).subscribe({
      next: res => {
        this.placing = false;
        if (res.success) {
          this.orderId = res.orderId;
          this.message = `Order placed (${res.orderId}).`;
          this.order.clear();
          setTimeout(() => this.router.navigate(['/products']), 1600);
        } else {
          this.message = 'Failed to place order.';
        }
      },
      error: () => {
        this.placing = false;
        this.message = 'Failed to place order.';
      }
    });
  }
}