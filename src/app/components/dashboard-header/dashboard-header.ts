import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  templateUrl: './dashboard-header.html',
  styleUrl: './dashboard-header.css'
})
export class DashboardHeader {
  @Input() role = 'Super Admin';
  @Input() userName = 'Vishwas Gour';
  @Input() email = 'vishwasgour@gmail.com';
  @Input() profileImage = 'https://i.pravatar.cc/150?img=12';
}