import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class NotificationsSettings {
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

  saveSettings() {
    this.isSaving = true;
    setTimeout(() => {
      alert('Notification preferences updated!');
      this.isSaving = false;
    }, 800);
  }
}
