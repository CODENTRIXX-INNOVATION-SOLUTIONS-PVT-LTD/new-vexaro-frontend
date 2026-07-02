import { Component } from '@angular/core';

@Component({
  selector: 'app-merchant-api-keys',
  imports: [],
  templateUrl: './merchant-api-keys.html',
  styleUrl: './merchant-api-keys.css',
})
export class MerchantApiKeys {

  apiKeys = [
    {
      name: 'Production Key',
      key: 'vx_live_xxxxxxxxxxxxx',
      createdAt: '10 Jun 2026',
      status: 'Active'
    },
    {
      name: 'Sandbox Key',
      key: 'vx_test_xxxxxxxxxxxxx',
      createdAt: '01 Jun 2026',
      status: 'Active'
    }
  ];

}