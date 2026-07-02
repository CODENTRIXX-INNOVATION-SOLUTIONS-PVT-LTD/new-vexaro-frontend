import { Component } from '@angular/core';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './pricing.html'
})
export class Pricing {
  readonly plans = [
    {
      name: 'Starter',
      tagline: 'For lean teams',
      features: ['Shipment booking', 'Tracking portal', 'Wallet overview', 'Email support'],
      recommended: false
    },
    {
      name: 'Growth',
      tagline: 'For scaling operators',
      features: ['Bulk upload', 'Rate cards', 'Distributor workflows', 'Priority support'],
      recommended: true
    },
    {
      name: 'Enterprise',
      tagline: 'For national networks',
      features: ['Custom controls', 'Advanced analytics', 'SLA governance', 'Dedicated success'],
      recommended: false
    }
  ];
}
