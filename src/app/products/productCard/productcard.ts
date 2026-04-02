import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../../models/product.model';
import { Router } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-product-card',
  templateUrl: './productcard.html',
  styleUrls: ['./productcard.scss'], 
  imports: [DecimalPipe,CommonModule]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<{ product: Product; quantity: number }>();
  @Output() buyNow = new EventEmitter<{ product: Product; quantity: number }>();

  qty = 1;

  constructor(private router: Router) {}

  openProduct() {
    sessionStorage.setItem('productsScroll', window.scrollY.toString());
    this.router.navigate(['/products', this.product.id]);
  }

  incQty(event?: Event) {
    event?.stopPropagation();
    this.qty++;
  }

  decQty(event?: Event) {
    event?.stopPropagation();
    if (this.qty > 1) this.qty--;
  }

  onAddToCart(event?: Event) {
    event?.stopPropagation();
    this.addToCart.emit({ product: this.product, quantity: this.qty });
    this.qty = 1; // reset to 1 after action (optional UX)
  }

  onBuyNow(event?: Event) {
    event?.stopPropagation();
    this.buyNow.emit({ product: this.product, quantity: this.qty });
  }
}