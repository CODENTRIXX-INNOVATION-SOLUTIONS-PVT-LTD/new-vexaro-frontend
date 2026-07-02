import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface FAQ {
  question: string;
  answer: string;
  category: string;
  expanded: boolean;
}

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './faqs.html',
  styleUrl: './faqs.css'
})
export class Faqs {
  searchTerm: string = '';
  activeCategory: string = 'All';

  categories = ['All', 'Getting Started', 'Merchants', 'Finance & Margins', 'Technical Support'];

  faqs: FAQ[] = [
    { question: 'How do I onboard a new merchant?', answer: 'Go to Merchants -> Manage Merchants -> Onboard Merchant. Fill in their details. Once they verify their email, you can assign them a Rate Card.', category: 'Getting Started', expanded: false },
    { question: 'How do I set my profit margins?', answer: 'You can define global or merchant-specific margins in the "Rate & Margins" section. The margin is the difference between the base Vexaro rate and the rate card you assign to your merchant.', category: 'Finance & Margins', expanded: false },
    { question: 'When are COD amounts remitted to merchants?', answer: 'Once Vexaro settles the COD amount to your Franchise Wallet, you can review and remit it to your merchants from the "COD Management" tab.', category: 'Finance & Margins', expanded: false },
    { question: 'How do I manage weight disputes raised by merchants?', answer: 'Merchants can raise weight disputes if they disagree with the charged weight. You can view, approve, or forward these disputes to Vexaro Support in the "Weight Disputes" section.', category: 'Merchants', expanded: false },
    { question: 'What happens if my Franchise Wallet balance is low?', answer: 'Your merchants will not be able to book new shipments if your master wallet balance cannot cover the shipping cost. Please top up your wallet via the "Finance -> Wallet" section.', category: 'Finance & Margins', expanded: false }
  ];

  get filteredFaqs() {
    return this.faqs.filter(faq => {
      const matchesSearch = faq.question.toLowerCase().includes(this.searchTerm.toLowerCase()) || faq.answer.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.activeCategory === 'All' || faq.category === this.activeCategory;
      return matchesSearch && matchesCategory;
    });
  }

  toggleFaq(faq: FAQ) {
    faq.expanded = !faq.expanded;
  }

  setCategory(cat: string) {
    this.activeCategory = cat;
  }
}
