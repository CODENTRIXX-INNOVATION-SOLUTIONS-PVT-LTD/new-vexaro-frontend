import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  templateUrl: './stats-cards.html',
  styleUrl: './stats-cards.css'
})
export class StatsCards {
  @Input() cards: any[] = [];
  /** When true the value area shows a loading skeleton instead of data. */
  @Input() isLoading = false;
}