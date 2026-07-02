import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  updatePassword() {
    if(!this.passwordData.current || !this.passwordData.newPass || !this.passwordData.confirm) {
      alert('Please fill in all password fields.');
      return;
    }
    if(this.passwordData.newPass !== this.passwordData.confirm) {
      alert('New passwords do not match.');
      return;
    }

    this.isSavingPass = true;
    setTimeout(() => {
      alert('Password updated successfully!');
      this.passwordData = { current: '', newPass: '', confirm: '' };
      this.isSavingPass = false;
    }, 1000);
  }

  toggle2FA() {
    this.twoFactorEnabled = !this.twoFactorEnabled;
    alert(this.twoFactorEnabled ? '2FA Enabled' : '2FA Disabled');
  }
}
