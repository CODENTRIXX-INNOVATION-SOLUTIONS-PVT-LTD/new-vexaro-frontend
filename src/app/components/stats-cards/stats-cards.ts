import { Component } from '@angular/core';

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  templateUrl: './stats-cards.html',
  styleUrl: './stats-cards.css'
})
export class StatsCards {

  cards = [
    {
      title: 'Total Shipments',
      value: '12,678',
      symbol: '+',
      percentage: '12.5'
    },
    {
      title: 'Delivered',
      value: '10,426',
      symbol: '+',
      percentage: '10.3'
    },
    {
      title: 'In Transit',
      value: '1,890',
      symbol: '+',
      percentage: '8.2'
    },
    {
      title: 'Pending',
      value: '362',
      symbol: '-',
      percentage: '4.5'
    },
    {
      title: 'Total Revenue',
      value: '₹45,67,890',
      symbol: '+',
      percentage: '15.6'
    }
  ];
}