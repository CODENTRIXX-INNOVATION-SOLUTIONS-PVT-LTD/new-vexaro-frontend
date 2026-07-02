import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../../services/settings.service';

@Component({
  selector: 'app-settings-security',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './security.html',
  styleUrl: './security.css'
})
export class SecuritySettings {
  passwordData = {
    current: '',
    newPass: '',
    confirm: ''
  };

  twoFactorEnabled: boolean = true;
  isSavingPass: boolean = false;

  constructor(private settingsService: SettingsService) {}

  updatePassword() {
    if(!this.passwordData.current || !this.passwordData.newPass || !this.passwordData.confirm) {
      alert('Please fill in all password fields.');
      return;
    }
    if(this.passwordData.newPass !== this.passwordData.confirm) {
      alert('New passwords do not match.');
      return;
    }
    if(this.passwordData.newPass.length < 6) {
      alert('New password must be at least 6 characters.');
      return;
    }

    this.isSavingPass = true;
    this.settingsService.changePassword({
      currentPassword: this.passwordData.current,
      newPassword: this.passwordData.newPass
    }).subscribe({
      next: () => {
        this.isSavingPass = false;
        alert('Password updated successfully!');
        this.passwordData = { current: '', newPass: '', confirm: '' };
      },
      error: (error) => {
        this.isSavingPass = false;
        alert(error.error?.message || 'Failed to update password. Please check your current password and try again.');
      }
    });
  }

  toggle2FA() {
    this.twoFactorEnabled = !this.twoFactorEnabled;
    alert(this.twoFactorEnabled ? '2FA Enabled' : '2FA Disabled');
  }
}
