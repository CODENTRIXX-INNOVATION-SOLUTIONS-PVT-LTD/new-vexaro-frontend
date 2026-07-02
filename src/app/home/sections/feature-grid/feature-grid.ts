import { Component } from '@angular/core';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-feature-grid',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './feature-grid.html'
})
export class FeatureGrid {
  readonly features = [
    {
      tag: '01 / Control',
      title: 'Multi-tier operating control',
      body: 'Corporate rules, distributor networks, and merchant warehouses \u2014 separated cleanly, governed centrally.'
    },
    {
      tag: '02 / Signal',
      title: 'Live shipment intelligence',
      body: 'Tracking, serviceability, weight disputes, carrier options, SLA \u2014 one operational pane of glass.'
    },
    {
      tag: '03 / Ledger',
      title: 'Financial clarity by design',
      body: 'Wallet debits, COD collection, surcharges, distributor margins \u2014 visible before they become tickets.'
    },
    {
      tag: '04 / Scale',
      title: 'Automation built for hubs',
      body: 'Bulk uploads, carrier selection, scan flows, run sheets, exception queues \u2014 engineered to remove manual work.'
    }
  ];
}
