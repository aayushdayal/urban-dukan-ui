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
  firstName = '';
  lastName = '';
  address = '';
  phone = '';
  userType = 'Buyer';
  error = '';

  constructor(private userService: UserService) {}

  signup() {
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }
    this.userService.register({
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      address: this.address,
      phone: this.phone,
      role: this.userType
    }).subscribe({
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
