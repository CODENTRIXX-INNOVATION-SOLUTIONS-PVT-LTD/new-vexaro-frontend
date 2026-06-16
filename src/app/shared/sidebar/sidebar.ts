import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MenuItem } from './sidebar.model';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar {
  sidebarClass = '';

  constructor(private router: Router) {}

  @Input()
  set title(value: string) {
    this.sidebarClass = value ? value.toLowerCase().replace(/\s+/g, '-') : '';
  }

  @Input() menuItems: MenuItem[] = [];

  collapsed = false;

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}