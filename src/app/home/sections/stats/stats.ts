import { Component } from '@angular/core';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { CountUpDirective } from '../../../shared/directives/count-up.directive';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [RevealDirective, CountUpDirective],
  templateUrl: './stats.html'
})
export class Stats {
  readonly stats = [
    { value: 5, suffix: 'M+', decimals: 0, label: 'Shipments managed' },
    { value: 268, suffix: '+', decimals: 0, label: 'Businesses onboarded' },
    { value: 99.6, suffix: '%', decimals: 1, label: 'Platform availability' },
    { value: 81, suffix: '+', decimals: 0, label: 'Cities covered' }
  ];
}
