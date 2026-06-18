import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuItem } from './sidebar.model';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit, OnDestroy {
  sidebarClass = '';

  constructor(private router: Router) {}

  @Input()
  set title(value: string) {
    this.sidebarClass = value ? value.toLowerCase().replace(/\s+/g, '-') : '';
  }

  @Input() menuItems: MenuItem[] = [];

  collapsed = false;
  drawerOpen = false;
  private routerSub!: Subscription;

  ngOnInit() {
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.autoExpandActive(event.urlAfterRedirects);
      this.drawerOpen = false; // Close drawer on navigation
    });
    
    // Initial check
    setTimeout(() => {
      this.autoExpandActive(this.router.url);
    }, 100);
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  toggleCollapse(): void {
    if(window.innerWidth < 1024) {
       this.toggleDrawer();
    } else {
       this.collapsed = !this.collapsed;
    }
  }

  toggleDrawer(): void {
    this.drawerOpen = !this.drawerOpen;
  }

  closeDrawer(): void {
    this.drawerOpen = false;
  }

  logout(): void {
    this.router.navigate(['/login']);
  }

  toggleSubmenu(item: MenuItem) {
    if (this.collapsed) {
      this.collapsed = false;
    }
    item.expanded = !item.expanded;
  }

  isParentActive(item: MenuItem): boolean {
    if (item.route && this.router.isActive(item.route, { paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' })) {
      return true;
    }
    if (item.children) {
      return item.children.some(child => 
        child.route && this.router.isActive(child.route, { paths: 'exact', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' })
      );
    }
    return false;
  }

  autoExpandActive(currentUrl: string) {
    this.menuItems.forEach(item => {
      if (item.children) {
        const isActive = item.children.some(child => child.route && currentUrl.includes(child.route));
        if (isActive) {
          item.expanded = true;
        }
      }
    });
  }
}