import { Component } from '@angular/core';

@Component({
  selector: 'app-logos-marquee',
  standalone: true,
  templateUrl: './logos-marquee.html'
})
export class LogosMarquee {
  readonly logos = [
    'VelocityHub', 'Cargolink', 'ParcelPro', 'HubFleet',
    'NorthGrid', 'ShipMint', 'Medlane', 'RetailOps'
  ];
}
