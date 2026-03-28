import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class Signup {
  email = '';
  password = '';
  confirmPassword = '';
  firstName = '';
  lastName = '';
  address = '';
  phone = '';
  userType = 'Buyer';
  success: string = '';
  error: string = '';
  returnUrl: string = '/';

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/';
    });
  }

  signup() {
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }
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
        // If backend returns token, use it; else, call login
        if (res.token && res.email && res.userId) {
          this.auth.setSession(res.token, res.email, res.userId);
          this.success = 'Registration successful!';
          this.router.navigateByUrl(this.returnUrl);
        } else {
          // fallback: login after registration
          this.userService.login({ email: this.email, password: this.password }).subscribe({
            next: (loginRes) => {
              this.auth.setSession(loginRes.token, loginRes.email, loginRes.userId);
              this.success = 'Registration successful!';
              this.router.navigateByUrl(this.returnUrl);
            },
            error: (err) => {
              this.error = err.error?.message || 'Auto-login failed. Please try logging in.';
            }
          });
        }
      },
      error: (err) => {
        this.error = err.error?.message || (typeof(err?.error) === 'string' ? err.error : 'Registration failed. Please try again.');
      }
    });
  }
}
