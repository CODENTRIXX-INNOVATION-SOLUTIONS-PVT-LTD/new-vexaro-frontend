import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [RouterLink, RevealDirective],
  templateUrl: './cta.html'
})
export class Cta {}
