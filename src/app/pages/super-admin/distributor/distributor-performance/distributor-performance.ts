import { Component } from '@angular/core';

@Component({
  selector: 'app-distributor-performance',
  imports: [],
  templateUrl: './distributor-performance.html',
  styleUrl: '../../../../common-css/super-admin-distrubutore-tabs.css'
})
export class DistributorPerformance {
  stats = {
  totalShipments: 425,
  completedShipments: 398,
  activeMerchants: 52,
  assignedWarehouses: 6,
  monthlyRevenue: 845000
};

}
