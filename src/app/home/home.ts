import { Component } from '@angular/core';
import { HomeNavbar } from './sections/navbar/navbar';
import { Hero } from './sections/hero/hero';
import { LogosMarquee } from './sections/logos-marquee/logos-marquee';
import { Workflow } from './sections/workflow/workflow';
import { CommandCenter } from './sections/command-center/command-center';
import { Stats } from './sections/stats/stats';
import { Cta } from './sections/cta/cta';
import { Footer } from './sections/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HomeNavbar,
    Hero,
    LogosMarquee,
    Workflow,
    CommandCenter,
    Stats,
    Cta,
    Footer
  ],
  templateUrl: './home.html'
})
export class Home {}
