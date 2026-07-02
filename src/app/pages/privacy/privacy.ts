import { Component } from '@angular/core';
import { HomeNavbar } from '../../home/sections/navbar/navbar';
import { Footer } from '../../home/sections/footer/footer';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [HomeNavbar, Footer],
  templateUrl: './privacy.html'
})
export class Privacy { }
