import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  email = '';
  password = '';
  confirmPassword = '';
  userType = 'Buyer';
  error = '';

  constructor(private userService: UserService) {}

  signup() {
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }
    this.userService.register({ email: this.email, password: this.password, userType: this.userType }).subscribe({
      next: (res) => {
        this.error = '';
        alert('Signup successful!');
      },
      error: (err) => {
        this.error = err.error || 'Signup failed';
      }
    });
  }
}
