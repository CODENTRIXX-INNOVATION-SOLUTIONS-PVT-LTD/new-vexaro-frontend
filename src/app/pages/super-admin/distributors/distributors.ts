import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AddDistributorModal } from '../../../models/add-distributor-modal/add-distributor-modal';
import { DistributorCreatedSuccess } from '../../../models/distributor-created-success/distributor-created-success';

@Component({
  selector: 'app-distributors',
  imports: [RouterLink, AddDistributorModal, DistributorCreatedSuccess],
  templateUrl: './distributors.html',
  styleUrl: './distributors.css'
})
export class Distributors {


  constructor(private router: Router) { }
  showModal = false;
  showAddModal = false;
  showSuccessModal = false;

  openSuccessModal() {
    this.showSuccessModal = true;
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }

  openAddModal() {
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  onDistributorSaved() {
    this.showAddModal = false;
      this.showSuccessModal = true;
  }


  distributors = [
    {
      id: 1,
      name: 'SpeedX Logistics',
      region: 'North Zone',
      contactPerson: 'Amit Verma',
      phone: '9876543210',
      status: 'Active'
    },
    {
      id: 2,
      name: 'FastWay Distributors',
      region: 'West Zone',
      contactPerson: 'Neha Singh',
      phone: '9123456780',
      status: 'Active'
    },
    {
      id: 3,
      name: 'QuickMove Logistics',
      region: 'South Zone',
      contactPerson: 'Rohit Kumar',
      phone: '9988776655',
      status: 'Inactive'
    },
    {
      id: 4,
      name: 'Swift Distributors',
      region: 'East Zone',
      contactPerson: 'Pooja Sharma',
      phone: '9001122334',
      status: 'Active'
    },
    {
      id: 5,
      name: 'Global Reach Dist.',
      region: 'Central Zone',
      contactPerson: 'Vijay Patel',
      phone: '8877665544',
      status: 'Active'
    }
  ];

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }


  goToUpdate(id: number) {
    this.router.navigate(['/super-admin/distributors/update', id]);
  }
}