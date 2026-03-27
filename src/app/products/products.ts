import { Component, HostListener, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product, ProductsResponse } from '../models/product.model';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-products',
  imports: [DecimalPipe, CommonModule],
  templateUrl: './products.html',
  styleUrls: ['./products.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  total = 0;
  loading = false;
  error = '';
  limit = 30;
  skip = 0;
  allLoaded = false;

  constructor(
    private productService: ProductService,
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
        // After first load, use limit=10 for subsequent loads
        this.limit = 10;
      },
      error: () => {
        this.error = 'Failed to load products.';
        this.loading = false;
      }
    });
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