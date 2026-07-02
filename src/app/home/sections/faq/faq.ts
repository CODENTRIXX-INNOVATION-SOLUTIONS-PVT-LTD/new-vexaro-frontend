import { Component, signal } from '@angular/core';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './faq.html'
})
export class Faq {
  openIndex = signal<number | null>(0);

  readonly items = [
    {
      q: 'What makes this different from courier software?',
      a: 'Vexaro isn\u2019t just a booking tool \u2014 it\u2019s a multi-tenant operating layer. SuperAdmin, distributors and merchants each get a governed view, with wallets, margins and carrier selection wired together end-to-end.'
    },
    {
      q: 'How does the wallet and commission structure work across tiers?',
      a: 'SuperAdmin allocates routing credit to distributors at a base markup. Distributors set their own downline rate cards for merchants. Booking debits both merchant and distributor wallets up front, and cancellations reverse the exact amounts.'
    },
    {
      q: 'How are weight disputes handled?',
      a: 'If a hub scan shows a heavier slab than declared, the surcharge is docked from the distributor\u2019s wallet and cascaded to the merchant. Evidence can be filed within 3 days to contest the adjustment.'
    },
    {
      q: 'Which carriers are supported?',
      a: 'Serviceability checks return live rates across DTDC, Ekart, Delhivery, Bluedart, XpressBees, Shadowfax and more \u2014 sorted by price or speed for each lane.'
    },
    {
      q: 'Can each distributor have its own pricing?',
      a: 'Yes. Distributors configure their own merchant-facing rate cards independently, while SuperAdmin retains visibility into corporate-to-distributor allocations only.'
    }
  ];

  toggle(index: number) {
    this.openIndex.set(this.openIndex() === index ? null : index);
  }
}
