import { Component, Input } from '@angular/core';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  @Input() closeModal?: () => void;
  @Input() openSignup?: () => void;

  email = '';
  password = '';
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

  login() {
    this.success = '';
    this.error = '';
    const credentials = { email: this.email, password: this.password };
    this.userService.login(credentials).subscribe({
      next: (res) => {
        // Assume res contains { token, email, userId }
        this.auth.setSession(res.token, res.email, res.userId);
        this.success = 'Login successful!';
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.error = err.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }

  showSignup() {
    if (this.closeModal) this.closeModal();
    if (this.openSignup) this.openSignup();
  }
}
