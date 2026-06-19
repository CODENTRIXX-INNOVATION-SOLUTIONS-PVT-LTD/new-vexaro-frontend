import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DistributorAnalytics } from '../../../../charts/distributor-analytics/distributor-analytics';

@Component({
    selector: 'app-distributors-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, DistributorAnalytics],
    templateUrl: './distributors-dashboard.html',
    styleUrl: './distributors-dashboard.css'
})
export class DistributorsDashboard implements OnInit {

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

    stats = {
        totalDistributors: 50,
        activeDistributors: 42,
        inactiveDistributors: 8,
        activeShipments: 122
    };

    ngOnInit(): void {
        this.calculateStats();
    }

    calculateStats(): void {
        this.stats.totalDistributors = this.distributors.length;
        this.stats.activeDistributors = this.distributors.filter(d => d.status === 'Active').length;
        this.stats.inactiveDistributors = this.distributors.filter(d => d.status === 'Inactive').length;
        this.stats.activeShipments = this.distributors.reduce((sum, d) => sum + d.activeShipments, 0);
    }
}
