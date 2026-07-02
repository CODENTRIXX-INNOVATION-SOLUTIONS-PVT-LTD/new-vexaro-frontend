import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../../services/settings.service';

@Component({
  selector: 'app-settings-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class NotificationsSettings implements OnInit {
  notifs = {
    email: {
      newMerchant: true,
      dailyReport: true,
      settlementAlert: true,
      securityAlert: true
    },
    sms: {
      walletLow: true,
      disputeRaised: true,
      codRemitted: false
    },
    push: {
      ticketUpdate: true,
      systemMaintenance: true
    }
  };

  isSaving: boolean = false;
  isLoading: boolean = false;

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.loadNotificationSettings();
  }

  loadNotificationSettings() {
    this.isLoading = true;
    this.settingsService.getNotificationPrefs().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.notifs = response.data;
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading notification settings:', error);
        this.isLoading = false;
      }
    });
  }

  saveSettings() {
    this.isSaving = true;
    this.settingsService.updateNotificationPrefs(this.notifs).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        alert('Notification preferences updated!');
      },
      error: (error: any) => {
        console.error('Error updating notification settings:', error);
        this.isSaving = false;
        alert(error.error?.message || 'Failed to update notification preferences. Please try again.');
      }
    });
  }
}
