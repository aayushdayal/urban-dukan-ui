import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CommonModule, DecimalPipe } from '@angular/common';

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

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
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

  addToCart() {
    if (this.product) {
      this.cartService.addToCart(this.product);
      this.message = 'Added to cart!';
      setTimeout(() => this.message = '', 2000);
    }
  }

  buyNow() {
    if (this.product) {
      this.cartService.addToCart(this.product);
      this.router.navigate(['/cart']);
    }
  }

  closeDetail() {
    this.router.navigate(['/products'], { replaceUrl: true });
  }
}