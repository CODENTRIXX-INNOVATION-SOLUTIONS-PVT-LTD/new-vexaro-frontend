import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../../services/settings.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-settings-security',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './security.html',
  styleUrl: './security.css',
})
export class SecuritySettings {
  private settingsService = inject(SettingsService);

  // Template uses isSavingPass (plain boolean, not signal)
  isSavingPass = false;
  saveSuccess  = false;
  errorMsg     = '';

  passwordData = { current: '', newPass: '', confirm: '' };

  updatePassword(): void {
    this.errorMsg    = '';
    this.saveSuccess = false;

    if (!this.passwordData.current || !this.passwordData.newPass || !this.passwordData.confirm) {
      this.errorMsg = 'Please fill in all password fields.';
      return;
    }
    if (this.passwordData.newPass !== this.passwordData.confirm) {
      this.errorMsg = 'New passwords do not match.';
      return;
    }
    if (this.passwordData.newPass.length < 8) {
      this.errorMsg = 'New password must be at least 8 characters.';
      return;
    }

    this.isSavingPass = true;

    this.settingsService.changePassword({
      currentPassword: this.passwordData.current,
      newPassword:     this.passwordData.newPass,
    }).pipe(finalize(() => { this.isSavingPass = false; })).subscribe({
      next: () => {
        this.saveSuccess  = true;
        this.passwordData = { current: '', newPass: '', confirm: '' };
        setTimeout(() => { this.saveSuccess = false; }, 3500);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Failed to update password.';
      },
    });
  }
}
