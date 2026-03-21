import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Signup } from "../signup/signup";
import { Login } from "../login/login";

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, Signup, Login],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class LandingComponent {
  showLogin = true;
  toggleForm() {
    this.showLogin = !this.showLogin;
  }
}
