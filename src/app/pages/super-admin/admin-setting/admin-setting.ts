import { Component, OnInit, inject, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformSettingsService, PlatformSettings } from '../../../services/platform-settings.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-setting.html',
  styleUrl: './admin-setting.css',
})
export class AdminSetting implements OnInit, OnDestroy {
  private platformSettingsService = inject(PlatformSettingsService);
  private destroy$ = new Subject<void>();

  // Signals for reactive state
  isLoading = signal(false);
  isEditing = signal(false);
  error = signal('');
  saveMessage = signal('');

  // Settings data
  settings: PlatformSettings = {
    companyName: '',
    logo: '',
    gstNumber: '',
    address: '',
    supportEmail: ''
  };

  // Private state
  private hasLoaded = false;
  private isProcessing = false;
  private originalSettings: PlatformSettings | null = null;

  constructor() {
    // Auto-clear success message after 3 seconds
    effect(() => {
      const msg = this.saveMessage();
      if (msg !== '') {
        const timer = setTimeout(() => this.saveMessage.set(''), 3000);
        return () => clearTimeout(timer);
      }
      return undefined;
    });

    // Auto-clear error message after 5 seconds
    effect(() => {
      const err = this.error();
      if (err !== '') {
        const timer = setTimeout(() => this.error.set(''), 5000);
        return () => clearTimeout(timer);
      }
      return undefined;
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  enableEdit(): void {
    // Store a deep copy of current settings for cancel functionality
    this.originalSettings = JSON.parse(JSON.stringify(this.settings));
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    // Revert to original settings without API call
    if (this.originalSettings) {
      this.settings = JSON.parse(JSON.stringify(this.originalSettings));
    }
    this.isEditing.set(false);
    this.error.set('');
  }

  loadSettings(): void {
    // Prevent duplicate loads and concurrent requests
    if (this.isProcessing || this.hasLoaded) {
      return;
    }

    this.isProcessing = true;
    this.isLoading.set(true);
    this.error.set('');

    this.platformSettingsService
      .getPlatformSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.settings = res.data || {
            companyName: '',
            logo: '',
            gstNumber: '',
            address: '',
            supportEmail: ''
          };
          this.originalSettings = JSON.parse(JSON.stringify(this.settings));
          this.hasLoaded = true;
          this.isLoading.set(false);
          this.isProcessing = false;
        },
        error: (err: any) => {
          this.error.set(err?.error?.message || 'Failed to load settings.');
          this.settings = {
            companyName: '',
            logo: '',
            gstNumber: '',
            address: '',
            supportEmail: ''
          };
          this.isLoading.set(false);
          this.isProcessing = false;
        },
      });
  }

  saveSettings(): void {
    // Prevent concurrent requests
    if (this.isProcessing) {
      return;
    }

    // Validate required fields
    if (!this.settings.companyName?.trim()) {
      this.error.set('Company name is required.');
      return;
    }

    if (!this.settings.supportEmail?.trim()) {
      this.error.set('Support email is required.');
      return;
    }

    // Validate email format
    if (!this.isValidEmail(this.settings.supportEmail)) {
      this.error.set('Please enter a valid email address.');
      return;
    }

    this.isProcessing = true;
    this.isLoading.set(true);
    this.error.set('');
    this.saveMessage.set('');

    this.platformSettingsService
      .updatePlatformSettings(this.settings)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.settings = res.data || this.settings;
          this.originalSettings = JSON.parse(JSON.stringify(this.settings));
          this.saveMessage.set('Platform settings saved successfully!');
          this.isLoading.set(false);
          this.isEditing.set(false);
          this.isProcessing = false;
        },
        error: (err: any) => {
          this.error.set(err?.error?.message || 'Failed to save settings.');
          this.isLoading.set(false);
          this.isProcessing = false;
        },
      });
  }

  /**
   * Simple email validation
   * For production, use a more robust validation library
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}