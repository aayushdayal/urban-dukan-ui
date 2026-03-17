import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = '';
  password = '';
  error = '';

  constructor(private userService: UserService) {}

  login() {
    this.userService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        // handle success (e.g., store user info, redirect)
        this.error = '';
        alert('Login successful!');
      },
      error: (err) => {
        this.error = err.error || 'Login failed';
      }
    });
  }
}
