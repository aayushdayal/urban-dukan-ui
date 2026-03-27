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
  @Output() addToCart = new EventEmitter<Product>();
  @Output() buyNow = new EventEmitter<Product>();

  constructor(private router: Router) {}

  openProduct() {
    sessionStorage.setItem('productsScroll', window.scrollY.toString());
    this.router.navigate(['/products', this.product.id]);
  }
}