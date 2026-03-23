import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
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

  constructor(private userService: UserService) {}

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
        this.success = 'Registration successful! You can now log in.';
      },
      error: (err) => {
        this.error = err.error?.message || (typeof(err?.error) === 'string' ? err.error : 'Registration failed. Please try again.');
      }
    });
  }
}
