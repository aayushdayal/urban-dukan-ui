import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, UpdateUserRequest } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user.html',
  styleUrls: ['./user.scss']
})
export class UserPage implements OnInit {
  loading = true;
  editing = false;
  message = '';
  error = '';
  profile: any = {
    id: 0,
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    roles: []
  };

  // editable copy
  editModel: UpdateUserRequest = {};

  constructor(
    private svc: UserService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      // not authenticated -> open login or redirect
      this.router.navigate(['/']);
      return;
    }
    this.load();
  }

  load() {
    this.loading = true;
    this.svc.getProfile().subscribe({
      next: (p) => {
        this.profile = p || this.profile;
        this.editModel = {
          firstName: p.firstName ?? null,
          lastName: p.lastName ?? null,
          address: p.address ?? null,
          phone: p.phone ?? null
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Failed to load profile';
        this.loading = false;
      }
    });
  }

  startEdit() {
    this.editing = true;
    this.message = '';
    this.error = '';
  }

  cancelEdit() {
    this.editing = false;
    // reset edits
    this.editModel = {
      firstName: this.profile.firstName ?? null,
      lastName: this.profile.lastName ?? null,
      address: this.profile.address ?? null,
      phone: this.profile.phone ?? null
    };
  }

  save() {
    this.message = '';
    this.error = '';
    this.svc.updateProfile(this.editModel).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.editing = false;
        this.message = 'Profile updated';
      },
      error: (err) => {
        this.error = err?.message || 'Update failed';
      }
    });
  }
}