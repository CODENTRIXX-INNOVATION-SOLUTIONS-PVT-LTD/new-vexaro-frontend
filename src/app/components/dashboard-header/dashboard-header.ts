import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  templateUrl: './dashboard-header.html',
  styleUrl: './dashboard-header.css'
})
export class DashboardHeader {
  @Input() role = '';
  @Input() userName = '';
  @Input() email = '';
  @Input() profileImage = '';
  // https://i.pravatar.cc/150?img=12

}