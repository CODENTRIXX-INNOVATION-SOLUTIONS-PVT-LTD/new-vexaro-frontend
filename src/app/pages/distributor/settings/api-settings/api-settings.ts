import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-api',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './api-settings.html',
  styleUrl: './api-settings.css'
})
export class ApiSettings {
  apiKeys = [
    { name: 'Production Hub App', key: 'vx_live_8f92a4bc...901e', created: '10 Jan 2024', lastUsed: 'Just now', status: 'Active' },
    { name: 'Testing Sandbox', key: 'vx_test_1c34x9yz...224b', created: '05 Mar 2024', lastUsed: '2 days ago', status: 'Active' }
  ];

  webhooks = [
    { url: 'https://mysystem.com/api/vexaro-hook', events: 'Shipment Created, Delivered', status: 'Active' }
  ];

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  }

  generateNewKey() {
    alert('Generating new API Key requires Admin verification (Simulated).');
  }

  addWebhook() {
    alert('Webhook creation dialog (Simulated).');
  }
}
