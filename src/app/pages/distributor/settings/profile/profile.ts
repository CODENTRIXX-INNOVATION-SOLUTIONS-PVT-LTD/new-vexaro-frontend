import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-settings-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileSettings implements OnInit {
  userId: string = '';
  profileData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    joiningDate: ''
  };

  isSaving: boolean = false;
  isLoading: boolean = false;

  constructor(private authService: AuthService, private userService: UserService) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.authService.getMe().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.userId = response.data.id || response.data._id || '';
          this.profileData = {
            firstName: response.data.firstName || '',
            lastName: response.data.lastName || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            role: response.data.role || '',
            joiningDate: response.data.createdAt || ''
          };
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading profile:', error);
        this.isLoading = false;
      }
    });
  }

  saveProfile() {
    if (!this.userId) {
      alert('User ID not found. Please refresh the page.');
      return;
    }
    this.isSaving = true;
    this.userService.updateUser(this.userId, {
      firstName: this.profileData.firstName,
      lastName: this.profileData.lastName,
      phone: this.profileData.phone
    }).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        alert('Profile updated successfully!');
      },
      error: (error: any) => {
        console.error('Error updating profile:', error);
        this.isSaving = false;
        alert(error.error?.message || 'Failed to update profile. Please try again.');
      }
    });
  }
}
