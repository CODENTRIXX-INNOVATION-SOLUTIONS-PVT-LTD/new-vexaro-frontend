import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-sidebar',
  standalone: true,
    imports: [MatIconModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar {
  @Input() title = '';
  @Input() menuItems: any[] = [];
}