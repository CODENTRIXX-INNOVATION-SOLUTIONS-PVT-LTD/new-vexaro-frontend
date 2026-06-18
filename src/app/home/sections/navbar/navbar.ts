import { Component, HostListener, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-navbar',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './navbar.html'
})
export class HomeNavbar {
  scrolled = signal(false);
  menuOpen = signal(false);

  readonly links: {label: string, href: string}[] = [];

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 50);
  }

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }

  closeMenu() {
    this.menuOpen.set(false);
  }
}
