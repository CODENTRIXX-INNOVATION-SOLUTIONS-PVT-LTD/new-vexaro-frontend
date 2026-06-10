import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  standalone: true,
    imports: [MatIconModule,RouterLink],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar {
  constructor(private router: Router) {}
  @Input() title = '';
  @Input() menuItems: any[] = [];
  logout() {
    this.router.navigate(['/login']);
  }
}