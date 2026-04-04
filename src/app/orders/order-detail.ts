import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, OrderDetail } from '../services/order.service';
import { ProductService } from '../services/product.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-detail.html',
  styleUrls: ['./order-detail.scss']
})
export class OrderDetailComponent implements OnInit {
  order?: OrderDetail;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: OrderService,
    private productSvc: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid order id';
      return;
    }
    this.load(id);
  }

  load(id: string) {
    this.loading = true;
    this.svc.getOrderById(id).subscribe({
      next: (o) => {
        this.order = o;
        // if items don't contain product info, fetch product details in parallel
        if (this.order?.items && this.order.items.length) {
          const calls = this.order.items.map(it => {
            // skip fetch if already has title/thumbnail/unitPrice
            if (it.title && (it.unitPrice ?? 0) > 0) return of(it);
            return this.productSvc.getProductById(it.productId).pipe(
              map(prod => ({
                ...it,
                title: it.title || prod.title,
                unitPrice: it.unitPrice || prod.price,
                thumbnail: (prod as any).thumbnail || (prod as any).images?.[0] || ''
              })),
              catchError(() => of(it))
            );
          });

          forkJoin(calls).subscribe(updated => {
            if (this.order) this.order.items = updated;
            this.loading = false;
            this.cdr.detectChanges(); // ensure immediate UI update
          }, () => {
            this.loading = false;
            this.cdr.detectChanges();
          });
        } else {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => { this.error = 'Failed to load order'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  back() {
    this.router.navigate(['/orders']);
  }

  getItemsTotal() {
    return (this.order?.items || []).reduce((s, it) => s + (it.totalPrice ?? it.unitPrice * it.quantity), 0);
  }
}