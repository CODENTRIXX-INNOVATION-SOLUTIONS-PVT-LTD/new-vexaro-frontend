import { Component } from '@angular/core';

@Component({
  selector: 'app-merchant-documents',
  imports: [],
  templateUrl: './merchant-documents.html',
  styleUrl: './merchant-documents.css',
})
export class MerchantDocuments {

  documents = [
    {
      name: 'GST Certificate',
      uploadedOn: '12 Jun 2026',
      status: 'Verified'
    },
    {
      name: 'PAN Card',
      uploadedOn: '12 Jun 2026',
      status: 'Verified'
    },
    {
      name: 'Business License',
      uploadedOn: '10 Jun 2026',
      status: 'Pending'
    },
    {
      name: 'Bank Statement',
      uploadedOn: '08 Jun 2026',
      status: 'Rejected'
    }
  ];

}