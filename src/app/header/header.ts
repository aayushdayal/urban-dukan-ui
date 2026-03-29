import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Login } from '../login/login';
import { Signup } from '../signup/signup';

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
  constructor(public auth: AuthService, private router: Router) {}

  openLogin() {
    this.showLoginModal = true;
    this.showSignupModal = false;
  }
  openSignup() {
    this.showSignupModal = true;
    this.showLoginModal = false;
  }
  closeModal() {
    this.showLoginModal = false;
    this.showSignupModal = false;
  }
  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}