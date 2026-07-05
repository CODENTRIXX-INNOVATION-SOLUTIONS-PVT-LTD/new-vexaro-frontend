import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../../services/settings.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-settings-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileSettings implements OnInit {
  private settingsService = inject(SettingsService);

  // Template uses isSaving as plain boolean, not signal
  isSaving    = false;
  saveSuccess = false;
  error       = '';

  profileData = {
    firstName:   '',
    lastName:    '',
    email:       '',
    phone:       '',
    companyName: '',
    address:     '',
    role:        'Distributor',
    joiningDate: '',
  };

  ngOnInit(): void { this.loadProfile(); }

  private loadProfile(): void {
    this.settingsService.getProfile().subscribe({
      next: (res) => {
        const u = res?.data ?? res;
        this.profileData.firstName   = u.firstName   ?? '';
        this.profileData.lastName    = u.lastName    ?? '';
        this.profileData.email       = u.email       ?? '';
        this.profileData.phone       = u.phone       ?? '';
        this.profileData.companyName = u.companyName ?? '';
        this.profileData.address     = u.address     ?? '';
        this.profileData.joiningDate = u.createdAt
          ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          : '';
      },
      error: (err) => { this.error = err?.error?.message || 'Failed to load profile.'; },
    });
  }

  saveProfile(): void {
    this.isSaving   = true;
    this.error      = '';
    this.saveSuccess = false;

    this.settingsService.updateProfile({
      firstName:   this.profileData.firstName   || undefined,
      lastName:    this.profileData.lastName    || undefined,
      phone:       this.profileData.phone       || undefined,
      companyName: this.profileData.companyName || undefined,
      address:     this.profileData.address     || undefined,
    }).pipe(finalize(() => { this.isSaving = false; })).subscribe({
      next: () => {
        this.saveSuccess = true;
        setTimeout(() => { this.saveSuccess = false; }, 3000);
      },
      error: (err) => { this.error = err?.error?.message || 'Failed to save profile.'; },
    });
  }
}
