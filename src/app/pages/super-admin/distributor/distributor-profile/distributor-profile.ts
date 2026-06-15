import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DistributorMerchants } from '../distributor-merchants/distributor-merchants';
import { DistributorPayments } from '../distributor-payments/distributor-payments';
import { DistributorPerformance } from '../distributor-performance/distributor-performance';
import { DistributorShipments } from '../distributor-shipments/distributor-shipments';
import { DistributorWarehouses } from '../distributor-warehouses/distributor-warehouses';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-update-distributor',
  standalone: true,
  imports: [   CommonModule,FormsModule, RouterLink, DistributorMerchants, DistributorPayments, DistributorPerformance, DistributorShipments, DistributorWarehouses],
  templateUrl: './distributor-profile.html',
  styleUrl: './distributor-profile.css'
})
export class DistributorProfile implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) { }
  activeTab: string = 'profile';

  changeTab(tab: string) {
    this.activeTab = tab;
  }
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

  assignWarehouse() {
    alert('Assign Warehouse feature coming soon');
  }

  generateLogin() {
    alert('Generate Login feature coming soon');
  }

  toggleStatus() {

    this.distributor.status =
      this.distributor.status === 'Active'
        ? 'Inactive'
        : 'Active';

    alert(
      `Distributor ${this.distributor.status === 'Active'
        ? 'Activated'
        : 'Deactivated'
      } Successfully`
    );
  }



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