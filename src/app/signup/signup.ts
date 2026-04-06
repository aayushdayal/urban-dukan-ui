import { Component, Input, ChangeDetectorRef, NgZone } from '@angular/core';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthModalService } from '../services/auth-modal.service'; // added

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class Signup {
  @Input() closeModal?: () => void;
  @Input() openLogin?: () => void;

  email = '';
  password = '';
  confirmPassword = '';
  firstName = '';
  lastName = '';
  address = '';
  phone = '';
  userType = 'Buyer';
  // minimal new state (do not remove anything existing)
  loading = false;
  success = '';
  error = '';
  returnUrl: string = '/';

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private modal: AuthModalService, // added
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || this.returnUrl;
    });

    // fallback when opened via modal service
    if (this.modal.returnUrl) {
      this.returnUrl = this.modal.returnUrl;
    }
  }

  signup() {
    // start loader and clear previous messages
    this.loading = true;
    this.success = '';
    this.error = '';

    // --- Client-side validation (model checks before API call) ---
    // 1) required fields
    const required = [
      { val: this.firstName, name: 'First name' },
      { val: this.lastName, name: 'Last name' },
      { val: this.email, name: 'Email' },
      { val: this.password, name: 'Password' },
      { val: this.confirmPassword, name: 'Confirm Password' },
      { val: this.address, name: 'Address' },
      { val: this.phone, name: 'Phone' }
    ];
    const missing = required.find(r => !r.val || String(r.val).trim().length === 0);
    if (missing) {
      this.ngZone.run(() => {
        this.loading = false;
        this.error = `${missing.name} is required`;
        this.cdr.detectChanges();
      });
      return;
    }

    // 2) email format
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(this.email)) {
      this.ngZone.run(() => {
        this.loading = false;
        this.error = 'Please enter a valid email address';
        this.cdr.detectChanges();
      });
      return;
    }

    // 3) phone numeric (7-15 digits)
    const phoneRe = /^\d{7,15}$/;
    if (!phoneRe.test(String(this.phone))) {
      this.ngZone.run(() => {
        this.loading = false;
        this.error = 'Please enter a valid phone number (digits only)';
        this.cdr.detectChanges();
      });
      return;
    }

    // 4) password strength
    // min 6 chars, at least 1 uppercase, 1 lowercase, 1 digit and 1 special char
    const pwdRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
    if (!pwdRe.test(this.password)) {
      this.ngZone.run(() => {
        this.loading = false;
        this.error = 'Password must be ≥6 chars and include uppercase, lowercase, digit and special character';
        this.cdr.detectChanges();
      });
      return;
    }

    // 5) confirm match
    if (this.password !== this.confirmPassword) {
      this.ngZone.run(() => {
        this.loading = false;
        this.error = 'Passwords do not match';
        this.cdr.detectChanges();
      });
      return;
    }
    // --- end validation ---

    const user = {
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      address: this.address,
      phone: this.phone,
      role: this.userType
    };

    this.userService.register(user).subscribe({
      next: (res) => {
        // stop loader and show success immediately
        this.ngZone.run(() => {
          this.loading = false;
          this.success = 'Account created successfully!';
          this.error = '';
          this.cdr.detectChanges();
        });

        if (res.token && res.email && res.userId) {
          this.auth.setSession(res.token, res.email, res.userId);
          this.modal.close();
          this.router.navigateByUrl(this.returnUrl);
        } else {
          // fallback: login after registration
          this.userService.login({ email: this.email, password: this.password }).subscribe({
            next: (loginRes) => {
              this.auth.setSession(loginRes.token, loginRes.email, loginRes.userId);
              this.success = 'Registration successful!';
              this.modal.close();
              this.router.navigateByUrl(this.returnUrl);
            },
            error: (err) => {
              this.error = err.error?.message || 'Auto-login failed. Please try logging in.';
            }
          });
        }
      },
      error: (err) => {
        const msg = err?.error?.message || 'Signup failed. Please try again.';
        this.ngZone.run(() => {
          this.loading = false;
          this.error = msg;
          this.success = '';
          this.cdr.detectChanges();
        });
      }
    });
  }

  showLogin() {
    if (this.closeModal) this.closeModal();
    if (this.openLogin) this.openLogin();
  }
}
