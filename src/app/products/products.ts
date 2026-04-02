import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product, ProductsResponse } from '../models/product.model';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { ProductCardComponent } from "./productCard/productcard";
import { AuthService } from '../services/auth.service';
import { AuthModalService } from '../services/auth-modal.service'; // added
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-products',
  imports: [ CommonModule, ProductCardComponent],
  templateUrl: './products.html',
  styleUrls: ['./products.scss'],
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  total = 0;
  loading = false;
  error = '';
  limit = 30;
  skip = 0;
  allLoaded = false;
  scrollTargetId: string | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private authModal: AuthModalService, // added
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    if (this.loading || this.allLoaded) return;
    this.loading = true;
    this.productService.getProducts(this.limit, this.skip).subscribe({
      next: (res: ProductsResponse) => {
        this.products = [...this.products, ...res.products];
        this.total = res.total;
        this.skip += this.limit;
        this.loading = false;
        if (this.products.length >= this.total) this.allLoaded = true;
        this.limit = 10;

        // Restore scroll position if needed
        const scroll = sessionStorage.getItem('productsScroll');
        if (scroll) {
          window.scrollTo({ top: +scroll, behavior: 'auto' });
          sessionStorage.removeItem('productsScroll');
        }

        // FIX: Force Angular to update the view after async changes
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load products.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onAddToCart(payload: { product: Product; quantity: number }) {
    if (!this.auth.isLoggedIn()) {
      // open the shared header modal and pass returnUrl so login can redirect back here
      this.authModal.openLogin(this.router.url);
      return;
    }
    this.cartService.addToCart(payload.product, payload.quantity);
    // open cart page after adding
    this.router.navigate(['/cart']);
  }

  onBuyNow(payload: { product: Product; quantity: number }) {
    if (!this.auth.isLoggedIn()) {
      this.authModal.openLogin(this.router.url);
      return;
    }
    // open place order for this single product
    this.orderService.setItems([{ product: payload.product, quantity: payload.quantity }]);
    this.router.navigate(['/place-order']);
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (
      (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 200) &&
      !this.loading && !this.allLoaded
    ) {
      this.loadProducts();
    }
  }
}