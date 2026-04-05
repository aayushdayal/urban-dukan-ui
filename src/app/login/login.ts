import { ChangeDetectorRef, Component, Input, NgZone } from '@angular/core';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthModalService } from '../services/auth-modal.service';

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
showSuccessMessage = false;
showErrorMessage = false;
showMessage = false;
  constructor(
    private userService: UserService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private modal: AuthModalService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || this.returnUrl;
    });

    // fallback: if opened via modal service, use its returnUrl
    if (this.modal.returnUrl) {
      this.returnUrl = this.modal.returnUrl;
    }
  }

  login() {
    this.success = '';
    this.error = '';
    const credentials = { email: this.email, password: this.password };
    this.userService.login(credentials).subscribe({
      next: (res) => {
        this.auth.setSession(res.token, res.email, res.userId);

        // ensure immediate UI update
        this.ngZone.run(() => {
          this.success = 'Login successful!';
          this.showSuccessMessage = true;
          this.showErrorMessage = false;
          this.cdr.detectChanges();
        });

        // close modal / navigate (still immediate)
        this.modal.close();
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.error = err.error?.message || 'Login failed. Please check your credentials.';
          this.showErrorMessage = true;
          this.showSuccessMessage = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  showSignup() {
    if (this.closeModal) this.closeModal();
    if (this.openSignup) this.openSignup();
  }
}
