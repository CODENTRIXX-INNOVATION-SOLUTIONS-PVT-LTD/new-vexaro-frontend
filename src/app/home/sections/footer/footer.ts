import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html'
})
export class Footer {
  readonly columns = [
    { title: 'Quick Links', links: ['Platform', 'Showcase', 'Pricing', 'Changelog'] },
    {
      title: 'Resources',
      links: ['About', 'Customers', 'Careers', 'Terms & Conditions', 'Privacy Policy', 'Resources']
    }
  ];

  readonly contact = {
    address: 'Flat 1113, 1st Floor, Chikitsak Nagar, Vijay Nagar, Indore, MP-452010',
    email: 'info@vexarocouriersolutions.com',
    phone: '+91-9183888181'
  };

  readonly legal = {
    cin: 'U53200MP2026PTC084168',
    registration: '084168'
  };

  readonly year = new Date().getFullYear();
}
