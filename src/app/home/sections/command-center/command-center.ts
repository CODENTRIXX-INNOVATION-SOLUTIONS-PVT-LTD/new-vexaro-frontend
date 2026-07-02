import { Component } from '@angular/core';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { CountUpDirective } from '../../../shared/directives/count-up.directive';

@Component({
  selector: 'app-command-center',
  standalone: true,
  imports: [RevealDirective, CountUpDirective],
  templateUrl: './command-center.html'
})
export class CommandCenter {
  readonly chart = [62, 78, 54, 70, 95, 88, 100, 92, 80, 66];

  readonly liveStats = [
    { label: 'Merchants', value: 15420 },
    { label: 'Distributors', value: 1250 },
    { label: 'Vehicles', value: 8400 },
    { label: 'States', value: 28 }
  ];

  readonly opsStats = [
    { label: 'Daily Orders', value: '1.2M+' },
    { label: 'Pin Codes', value: '19,000+' },
    { label: 'Active Hubs', value: '450+' }
  ];
}
