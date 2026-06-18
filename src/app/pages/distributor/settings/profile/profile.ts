import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileSettings {
  profileData = {
    firstName: 'Rohan',
    lastName: 'Sharma',
    email: 'rohan.distributor@vexaro.com',
    phone: '+91 9876543210',
    role: 'Distributor Admin',
    joiningDate: '15 Jan 2024'
  };

  isSaving: boolean = false;

  saveProfile() {
    this.isSaving = true;
    setTimeout(() => {
      alert('Profile updated successfully!');
      this.isSaving = false;
    }, 1000);
  }
}
