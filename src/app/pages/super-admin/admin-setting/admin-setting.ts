import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-setting.html',
  styleUrl: './admin-setting.css',
})
export class AdminSetting {

  settings = {

    companySettings: {
      companyName: 'Vaxaro',
      logo: '',
      gstNumber: '22AAAAA0000A1Z5',
      address: 'Bhopal, Madhya Pradesh',
      supportEmail: 'support@vaxaro.com'
    },

    notificationSettings: {
      smsEnabled: true,
      emailEnabled: true,
      whatsappEnabled: false
    },

    apiSettings: {
      apiKey: 'vx_live_123456789',
      webhookUrl: 'https://api.vaxaro.com/webhook',
      secretKey: 'vx_secret_123456789'
    }

  };

  saveSettings() {
    console.log(this.settings);
    alert('Settings saved successfully!');
  }

}