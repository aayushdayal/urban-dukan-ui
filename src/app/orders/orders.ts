import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService, OrderSummary } from '../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './orders.html',
  styleUrls: ['./orders.scss']
})
export class OrdersComponent implements OnInit {
  orders: OrderSummary[] = [];
  loading = false;
  error = '';

  constructor(private svc: OrderService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.svc.getMyOrders().subscribe({
      next: (o) => { this.orders = o || []; this.loading = false; },
      error: (err) => { this.error = 'Failed to load orders'; this.loading = false; }
    })
    // ensure immediate view update after async-set above
    .add(() => this.cdr.detectChanges());
  }

  open(order: OrderSummary) {
    // navigate to detail view (orderId expected to be GUID/string)
    this.router.navigate(['/orders', order.orderId]);
  }
}