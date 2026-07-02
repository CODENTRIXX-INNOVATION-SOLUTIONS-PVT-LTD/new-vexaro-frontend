import { Component } from '@angular/core';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './resources.html'
})
export class Resources {
  readonly cards = [
    {
      tag: 'Blog',
      title: 'Reducing weight dispute leakage',
      body: 'How better data capture protects merchant and distributor margins.'
    },
    {
      tag: 'Guide',
      title: 'Building a scalable hub network',
      body: 'Operational patterns for regional branch owners and corporate teams.'
    },
    {
      tag: 'Careers',
      title: 'Join the logistics OS team',
      body: 'Hiring across product, operations, support and enterprise success.'
    }
  ];
}
