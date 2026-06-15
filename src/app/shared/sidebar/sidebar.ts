import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar {
  constructor(private router: Router) { }
  @Input() title = '';
  @Input() callFrom = '';
  @Input() menuItems: any[] = [];
  logout() {
    this.router.navigate(['/login']);
  }
}