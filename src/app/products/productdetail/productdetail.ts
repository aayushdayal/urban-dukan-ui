import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CommonModule, DecimalPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AuthModalService } from '../../services/auth-modal.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './productdetail.html',
  styleUrls: ['./productdetail.scss'],
  imports: [CommonModule, DecimalPipe]
})
export class ProductDetailComponent implements OnInit {
  product?: Product;
  error = '';
  message = '';
  qty = 1;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private auth: AuthService,
    private authModal: AuthModalService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef // <-- add this
  ) {}

  ngOnInit() {
    // Subscribe to paramMap to react to route changes
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.productService.getProductById(id).subscribe({
          next: prod => {
            this.product = prod;
            this.error = '';
            this.cdr.detectChanges(); // <-- force view update
          },
          error: () => {
            this.error = 'Product not found or failed to load.';
            this.product = undefined;
            this.cdr.detectChanges(); // <-- force view update
          }
        });
      }
    });
  }

  incQty() {
    this.qty++;
  }

  decQty() {
    if (this.qty > 1) this.qty--;
  }

  addToCart() {
    if (this.product) {
      if (!this.auth.isLoggedIn()) {
        // open shared login modal and pass current url as returnUrl
        this.authModal.openLogin(this.router.url);
        return;
      }

      this.cartService.addToCart(this.product, this.qty);
      // navigate to cart page for logged-in user
      this.router.navigate(['/cart']);
      this.qty = 1;
    }
  }

  buyNow() {
    if (this.product) {
      if (!this.auth.isLoggedIn()) {
        this.authModal.openLogin(this.router.url);
        return;
      }
      // open place order for only this product
      this.orderService.setItems([{ product: this.product, quantity: this.qty }]);
      this.router.navigate(['/place-order']);
    }
  }

  closeDetail() {
    this.router.navigate(['/products'], { replaceUrl: true });
  }
}