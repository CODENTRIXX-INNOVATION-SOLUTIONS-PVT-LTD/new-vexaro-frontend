import { Component } from '@angular/core';
import { CountUpDirective } from '../../../shared/directives/count-up.directive';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CountUpDirective, RevealDirective],
  templateUrl: './hero.html'
})
export class Hero {
  readonly networkNodes = [
    { label: 'Mumbai', x: 70, y: 300, color: '#e8743a', pulseDur: '2.8s' },
    { label: 'Delhi', x: 230, y: 320, color: '#5eead4', pulseDur: '3.4s' },
    { label: 'Kolkata', x: 470, y: 300, color: '#e8743a', pulseDur: '3.1s' },
    { label: 'Bengaluru', x: 590, y: 70, color: '#5eead4', pulseDur: '2.6s' }
  ];
}
