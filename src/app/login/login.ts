import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
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
  email = '';
  password = '';
  success: string = '';
  error: string = '';

  constructor(private userService: UserService) {}

  login() {
    this.success = '';
    this.error = '';
    const credentials = {
      email: this.email,
      password: this.password
    };
    this.userService.login(credentials).subscribe({
      next: (res) => {
        this.success = 'Login successful!';
        // Optionally, redirect or store token here
      },
      error: (err) => {
        this.error = err.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }
}
