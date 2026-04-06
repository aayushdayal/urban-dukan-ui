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

  // new loading flag
  loading = false;

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
    // start loading and clear previous messages
    this.loading = true;
    this.success = '';
    this.error = '';
    this.showSuccessMessage = false;
    this.showErrorMessage = false;

    const credentials = { email: this.email, password: this.password };
    this.userService.login(credentials).subscribe({
      next: (res) => {
        this.auth.setSession(res.token, res.email, res.userId);

        // update UI immediately: stop loader and show success
        this.ngZone.run(() => {
          this.loading = false;
          this.success = 'Login successful!';
          this.showSuccessMessage = true;
          this.showErrorMessage = false;
          this.cdr.detectChanges();
        });

        // allow message to render briefly, then close modal / navigate
        setTimeout(() => {
          this.ngZone.run(() => {
            this.modal.close();
            this.router.navigateByUrl(this.returnUrl);
          });
        }, 600);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Login failed. Please check your credentials.';
        this.ngZone.run(() => {
          this.loading = false;
          this.error = msg;
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
