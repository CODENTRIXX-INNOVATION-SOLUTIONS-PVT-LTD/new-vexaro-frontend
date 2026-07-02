import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../../services/settings.service';

@Component({
  selector: 'app-settings-api',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './api-settings.html',
  styleUrl: './api-settings.css'
})
export class ApiSettings implements OnInit {
  apiKeys: any[] = [];
  webhooks: any[] = [];
  isLoading: boolean = false;
  isGeneratingKey: boolean = false;
  isAddingWebhook: boolean = false;

  newKeyName: string = '';
  newWebhookUrl: string = '';
  newWebhookEvents: string = '';

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.loadApiKeys();
  }

  loadApiKeys() {
    this.isLoading = true;
    this.settingsService.getApiKeys().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.apiKeys = response.data;
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading API keys:', error);
        this.isLoading = false;
      }
    });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  }

  generateNewKey() {
    if (!this.newKeyName.trim()) {
      alert('Please enter a name for the API key.');
      return;
    }
    this.isGeneratingKey = true;
    this.settingsService.createApiKey({ name: this.newKeyName }).subscribe({
      next: (response: any) => {
        this.isGeneratingKey = false;
        this.newKeyName = '';
        alert('API key generated successfully!');
        this.loadApiKeys();
      },
      error: (error: any) => {
        this.isGeneratingKey = false;
        alert(error.error?.message || 'Failed to generate API key. Please try again.');
      }
    });
  }

  revokeKey(id: string) {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      this.settingsService.revokeApiKey(id).subscribe({
        next: (response: any) => {
          alert('API key revoked successfully!');
          this.loadApiKeys();
        },
        error: (error: any) => {
          alert(error.error?.message || 'Failed to revoke API key. Please try again.');
        }
      });
    }
  }

  addWebhook() {
    if (!this.newWebhookUrl.trim() || !this.newWebhookEvents.trim()) {
      alert('Please enter webhook URL and events.');
      return;
    }
    this.isAddingWebhook = true;
    // Note: Webhook endpoint not in current backend - this is a placeholder
    // Backend would need to implement webhook management
    setTimeout(() => {
      this.isAddingWebhook = false;
      this.webhooks.push({
        url: this.newWebhookUrl,
        events: this.newWebhookEvents,
        status: 'Active'
      });
      this.newWebhookUrl = '';
      this.newWebhookEvents = '';
      alert('Webhook added successfully!');
    }, 500);
  }

  deleteWebhook(index: number) {
    if (confirm('Are you sure you want to delete this webhook?')) {
      this.webhooks.splice(index, 1);
      alert('Webhook deleted successfully!');
    }
  }
}
