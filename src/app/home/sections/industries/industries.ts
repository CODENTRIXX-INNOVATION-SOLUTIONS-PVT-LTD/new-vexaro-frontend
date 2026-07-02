import { Component } from '@angular/core';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-industries',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './industries.html'
})
export class Industries {
  readonly items = [
    { index: '01', name: 'E-commerce', body: 'Workflow-ready controls for shipments, exceptions & visibility', highlight: true },
    { index: '02', name: 'Retail', body: 'Workflow-ready controls for shipments, exceptions & visibility', highlight: false },
    { index: '03', name: 'Healthcare', body: 'Workflow-ready controls for shipments, exceptions & visibility', highlight: false }
  ];

  // Stylised network-map node positions (percentages within the canvas)
  readonly nodes = [
    { x: 18, y: 30 }, { x: 28, y: 55 }, { x: 35, y: 22 }, { x: 46, y: 40 },
    { x: 52, y: 65 }, { x: 60, y: 28 }, { x: 68, y: 50 }, { x: 76, y: 35 },
    { x: 82, y: 60 }, { x: 24, y: 75 }, { x: 58, y: 75 }, { x: 90, y: 45 }
  ];

  readonly hub = { x: 56, y: 45 };
}
