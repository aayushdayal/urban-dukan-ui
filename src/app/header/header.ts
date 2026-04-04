import { Component, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { AuthModalService } from '../services/auth-modal.service';
import { SearchComponent } from './search/search.component';
import { Login } from '../login/login';
import { Signup } from '../signup/signup';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, Login, Signup, SearchComponent, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class HeaderComponent implements OnDestroy {
  showDropdown = false;
  showLoginModal = false;
  showSignupModal = false;
  private modalSub: Subscription | null = null;

  // expose auth to template; inject router for navigation
  constructor(public auth: AuthService, private router: Router, private authModal: AuthModalService) {
    // subscribe to central modal service so any component can open login/signup
    this.modalSub = this.authModal.open$.subscribe((type) => {
      this.showLoginModal = type === 'login';
      this.showSignupModal = type === 'signup';
    });
  }

  // navigate to cart page
  goToCart() {
    this.router.navigate(['/cart']);
  }

  // functions used by template (keep them for direct header clicks)
  openLogin() { this.authModal.openLogin(); }
  openSignup() { this.authModal.openSignup(); }

  // close via service so subscriptions remain consistent
  closeModal() {
    this.showLoginModal = false;
    this.showSignupModal = false;
    this.authModal.close();
  }

  // helpers passed into child modal components
  closeModalFn = () => this.closeModal();
  openSignupFromLogin = () => this.authModal.openSignup();
  openLoginFromSignup = () => this.authModal.openLogin();

  logout() {
    try { localStorage.removeItem('token'); } catch { /* ignore */ }
    if ((this.auth as any).logout) { (this.auth as any).logout(); }
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    if (this.modalSub) { this.modalSub.unsubscribe(); this.modalSub = null; }
  }
}