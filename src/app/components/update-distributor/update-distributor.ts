import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-update-distributor',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './update-distributor.html',
  styleUrl: './update-distributor.css'
})
export class UpdateDistributor implements OnInit {

  distributorId!: number;

  distributor = {
    distributorName: '',
    displayName: '',
    email: '',
    phone: '',
    address: '',
    region: '',
    city: '',
    state: '',
    pincode: '',

    contactPerson: '',
    contactPhone: '',
    contactEmail: '',

    gstNumber: '',
    panNumber: '',
    paymentTerms: '15 Days',
    creditLimit: 0,

    status: 'Active'
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.distributorId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.loadDistributor();
  }

  loadDistributor() {

    // Dummy Data

    this.distributor = {
      distributorName: 'SpeedLink Distributors',
      displayName: 'SpeedLink',

      email: 'contact@speedlink.com',
      phone: '9876543210',

      address: '123 Logistic Park, Andheri East',
      region: 'West Zone',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400069',

      contactPerson: 'Rajesh Mehta',
      contactPhone: '9876543210',
      contactEmail: 'rajesh@speedlink.com',

      gstNumber: '27ABCDE1234F1Z5',
      panNumber: 'ABCDE1234F',
      paymentTerms: '15 Days',
      creditLimit: 100000,

      status: 'Active'
    };
  }

  updateDistributor() {

    console.log(this.distributor);

    // API Call Here

    alert('Distributor Updated Successfully');
  }
}