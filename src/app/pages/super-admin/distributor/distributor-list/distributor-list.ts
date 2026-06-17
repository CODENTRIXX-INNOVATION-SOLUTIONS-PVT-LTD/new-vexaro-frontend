import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AddDistributorModal } from '../../../../models/add-distributor-modal/add-distributor-modal';
import { DistributorCreatedSuccess } from '../../../../models/distributor-created-success/distributor-created-success';
import { CommonModule } from '@angular/common';
import { FinancialStore } from '../../../../shared/financial-store';

@Component({
  selector: 'app-distributor-list',
  imports: [RouterLink, AddDistributorModal, DistributorCreatedSuccess, CommonModule],
  templateUrl: './distributor-list.html',
  styleUrl: './distributor-list.css'
})
export class DistributorList {


  constructor(private router: Router) { }
  showModal = false;
  showAddModal = false;
  showSuccessModal = false;

  activeMenu: number | null = null;

  toggleMenu(id: number) {
    this.activeMenu = this.activeMenu === id ? null : id;
  }

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
      activeShipments: 31,
      status: 'Active'
    },
    {
      id: 2,
      name: 'FastWay Distributors',
      region: 'West Zone',
      contactPerson: 'Neha Singh',
      phone: '9123456780',
      activeShipments: 16,
      status: 'Active'
    },
    {
      id: 3,
      name: 'QuickMove Logistics',
      region: 'South Zone',
      contactPerson: 'Rohit Kumar',
      phone: '9988776655',
      activeShipments: 51,
      status: 'Inactive'
    },
    {
      id: 4,
      name: 'Swift Distributors',
      region: 'East Zone',
      contactPerson: 'Pooja Sharma',
      phone: '9001122334',
      activeShipments: 13,
      status: 'Active'
    },
    {
      id: 5,
      name: 'Global Reach Dist.',
      region: 'Central Zone',
      contactPerson: 'Vijay Patel',
      phone: '8877665544',
      activeShipments: 12,
      status: 'Active'
    }
  ];

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }


  viewDistributor(id: number): void {
    this.router.navigate(['/super-admin/distributors/profile', id]);
  }

  get allDistributors() {
    const mappedRequests = FinancialStore.onboardingRequests.map((req, index) => ({
      id: 10 + index,
      name: req.distributorName,
      region: req.region,
      contactPerson: 'Ketan Meena',
      phone: req.phone,
      activeShipments: 0,
      status: req.status
    }));
    return [...this.distributors, ...mappedRequests];
  }

  approveDistributor(name: string) {
    const req = FinancialStore.onboardingRequests.find(r => r.distributorName === name);
    if (req) {
      req.status = 'Active';
      alert(`Distributor account for "${name}" approved successfully!`);
    }
  }
}