import { Component } from '@angular/core';
import { HomeNavbar } from '../../home/sections/navbar/navbar';
import { Footer } from '../../home/sections/footer/footer';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [HomeNavbar, Footer],
  templateUrl: './terms.html'
})
export class Terms { }
