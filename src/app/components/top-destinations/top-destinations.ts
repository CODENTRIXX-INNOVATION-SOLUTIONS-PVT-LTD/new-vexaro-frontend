import { Component, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-top-destinations',
  imports: [],
  templateUrl: './top-destinations.html',
  styleUrl: './top-destinations.css'
})
export class TopDestinations implements AfterViewInit {

  ngAfterViewInit() {

    new Chart("destinationChart", {
      type: 'bar',
      data: {
        labels: [
          'Mumbai',
          'Delhi',
          'Bangalore',
          'Hyderabad',
          'Chennai'
        ],
        datasets: [{
          data: [2450,2110,1680,1230,980]
        }]
      },
      options: {
        indexAxis: 'y',
        responsive:true,
        maintainAspectRatio:false
      }
    });

  }

}