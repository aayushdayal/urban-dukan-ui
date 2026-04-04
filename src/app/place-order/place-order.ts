import { Component, OnInit, ChangeDetectorRef, NgZone, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../services/order.service';
import { CartItem } from '../services/cart.service';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../services/user.service';

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

  // modal state for success popup
  showSuccessModal = false;

  @ViewChild('modalClose') modalClose!: ElementRef<HTMLButtonElement>;

  // new flags
  isAuthenticated = false;
  loadingProfile = true;

  constructor(
    private order: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.items = this.order.getItems() || [];
    if (!this.items.length) {
      // optionally redirect or show message
    }

    // try load authenticated user's profile (graceful fallback for guests)
    this.fetchProfile();
  }

  private fetchProfile() {
    this.loadingProfile = true;
    this.userService.getProfile().subscribe(
      (res: UserProfile) => {
        const fullName = [res.firstName, res.lastName].filter(Boolean).join(' ').trim();
        if (fullName) this.name = fullName;
        if (res.address) this.address = res.address;
        if (res.phone) this.phone = res.phone;
        this.isAuthenticated = true;
        this.loadingProfile = false;
      },
      () => {
        // if not authenticated or other error, allow guest input
        this.isAuthenticated = false;
        this.loadingProfile = false;
      }
    );
  }

  close() {
    this.router.navigate(['/products']);
  }

  getTotal() {
    return this.items.reduce((s, it) => s + it.product.price * it.quantity, 0);
  }

  placeOrder() {
    this.message = '';
    if (!this.items || !this.items.length) {
      this.message = 'No items to place order.';
      return;
    }

    this.placing = true;
    const payload = {
      name: this.name,
      address: this.address,
      phone: this.phone,
      items: this.items
    };

    this.order.placeOrder(payload).subscribe(
      (res) => {
        this.placing = false;
        if (res.success && res.orderId) {
          this.orderId = res.orderId;

          // ensure change detection runs inside angular zone and focus modal
          this.ngZone.run(() => {
            this.showSuccessModal = true;
            this.cdr.detectChanges();
            // focus close button on next tick so keyboard / screen readers see it immediately
            setTimeout(() => this.modalClose?.nativeElement?.focus(), 0);
          });

          this.order.clear();
          this.items = [];
        } else {
          this.message = 'Failed to place order. Please try again.';
        }
      },
      () => {
        this.placing = false;
        this.message = 'Failed to place order. Please try again.';
      }
    );
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    this.router.navigate(['/products']);
  }
}

interface UserProfile {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
}