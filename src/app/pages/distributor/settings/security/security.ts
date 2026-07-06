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

  isSavingPass = false;
  saveSuccess  = false;
  errorMsg     = '';

  passwordData = { current: '', newPass: '', confirm: '' };

  // Show/hide toggles for each field
  showCurrent = false;
  showNew     = false;
  showConfirm = false;

  // Live strength tracking
  get strength(): { label: string; level: number; color: string } {
    const p = this.passwordData.newPass;
    if (!p) return { label: '', level: 0, color: '' };

    let score = 0;
    if (p.length >= 12)                  score++;
    if (/[A-Z]/.test(p))                 score++;
    if (/[a-z]/.test(p))                 score++;
    if (/\d/.test(p))                    score++;
    if (/[^A-Za-z0-9\s]/.test(p))        score++;

    if (score <= 2) return { label: 'Weak',      level: score, color: '#ef4444' };
    if (score === 3) return { label: 'Fair',      level: score, color: '#f59e0b' };
    if (score === 4) return { label: 'Strong',    level: score, color: '#22c55e' };
    return              { label: 'Very Strong', level: score, color: '#16a34a' };
  }

  // Validation rules shown as checklist
  get rules() {
    const p = this.passwordData.newPass;
    return [
      { text: 'At least 12 characters',           ok: p.length >= 12 },
      { text: 'One uppercase letter (A–Z)',        ok: /[A-Z]/.test(p) },
      { text: 'One lowercase letter (a–z)',        ok: /[a-z]/.test(p) },
      { text: 'One number (0–9)',                  ok: /\d/.test(p) },
      { text: 'One symbol (!@#$…)',                ok: /[^A-Za-z0-9\s]/.test(p) },
      { text: 'No spaces',                         ok: p.length > 0 && !/\s/.test(p) },
    ];
  }

  get allRulesPassed(): boolean {
    return this.rules.every(r => r.ok);
  }

  updatePassword(): void {
    this.errorMsg    = '';
    this.saveSuccess = false;

    if (!this.passwordData.current) {
      this.errorMsg = 'Please enter your current password.';
      return;
    }
    if (!this.passwordData.newPass) {
      this.errorMsg = 'Please enter a new password.';
      return;
    }
    if (!this.allRulesPassed) {
      this.errorMsg = 'New password does not meet the requirements below.';
      return;
    }
    if (this.passwordData.newPass === this.passwordData.current) {
      this.errorMsg = 'New password must be different from your current password.';
      return;
    }
    if (this.passwordData.newPass !== this.passwordData.confirm) {
      this.errorMsg = 'New passwords do not match.';
      return;
    }

    this.isSavingPass = true;
    this.settingsService.changePassword({
      currentPassword: this.passwordData.current,
      newPassword:     this.passwordData.newPass,
    }).pipe(finalize(() => { this.isSavingPass = false; }))
      .subscribe({
        next: () => {
          this.saveSuccess  = true;
          this.passwordData = { current: '', newPass: '', confirm: '' };
          this.showCurrent  = false;
          this.showNew      = false;
          this.showConfirm  = false;
          setTimeout(() => { this.saveSuccess = false; }, 4000);
        },
        error: (err) => {
          // Map backend error codes to friendly messages
          const msg: string = err?.error?.message || '';
          if (msg.toLowerCase().includes('incorrect') || msg.toLowerCase().includes('wrong')) {
            this.errorMsg = 'Current password is incorrect.';
          } else if (msg) {
            this.errorMsg = msg;
          } else {
            this.errorMsg = 'Failed to update password. Please try again.';
          }
        },
      });
  }
}
