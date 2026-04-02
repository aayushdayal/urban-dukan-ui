import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Login } from '../login/login';
import { Signup } from '../signup/signup';
import { AuthModalService } from '../services/auth-modal.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, Login, Signup],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class HeaderComponent {
  showDropdown = false;
  showLoginModal = false;
  showSignupModal = false;
  constructor(public auth: AuthService, private router: Router, private modal: AuthModalService) {
    // subscribe to service so other components can open the modal
    this.modal.open$.subscribe(mode => {
      this.showLoginModal = mode === 'login';
      this.showSignupModal = mode === 'signup';
    });
  }

  openLogin() {
    // keep existing behavior for header button
    this.modal.openLogin();
  }
  openSignup() {
    this.modal.openSignup();
  }
  closeModal() {
    this.modal.close();
  }
  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}