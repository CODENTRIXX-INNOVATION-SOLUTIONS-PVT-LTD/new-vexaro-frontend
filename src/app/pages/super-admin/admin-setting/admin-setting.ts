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
      companyName: 'Vexaro',
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

    // Business Rules Configuration
    platformRateConfig: {
      markupPercentage: 5.0, // Vexaro markup over Velocity base rates
    },
    
    weightSlabManagement: {
      baseWeightLimit: 0.5, // Base weight in kg
      extraWeightStep: 0.5, // Step size in kg for additional charges
    },
    
    compensationCeiling: {
      defaultCapPerShipment: 5000, // INR maximum compensation
    },
    
    weightDisputeWindow: {
      defaultDaysAllowed: 3, // Days distributor has to raise dispute
    }

  };

  saveSettings() {
    console.log('Saving Business Rules & UI Settings:', this.settings);
    alert('Platform Configuration Settings saved successfully! \n\nNote: Velocity API credentials are automatically managed securely by the backend via .env');
  }

}
