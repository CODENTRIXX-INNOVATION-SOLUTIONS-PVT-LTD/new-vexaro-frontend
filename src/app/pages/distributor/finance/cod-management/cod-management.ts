import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../../../services/finance.service';
import { AuthService } from '../../../../services/auth.service';

export interface CODRecord {
  id: string;
  awb: string;
  merchantName: string;
  merchantId: string;
  amount: number;
  status: string;
  rawStatus: string;
  date: string;
}

@Component({
  selector: 'app-cod-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cod-management.html',
  styleUrl: './cod-management.css'
})
export class CodManagement implements OnInit {
  private financeService = inject(FinanceService);
  private authService = inject(AuthService);

  records: CODRecord[] = [];
  filteredRecords: CODRecord[] = [];
  isLoading: boolean = false;
  userRole: string = '';

  searchTerm: string = '';
  statusFilter: string = 'All';

  summary = {
    pending: 0,
    remitted: 0,
    returned: 0
  };

  ngOnInit() {
    this.authService.getMe().subscribe({
      next: (user) => {
        this.userRole = user.role;
      },
      error: (err) => console.error('Failed to get user profile:', err)
    });
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.financeService.listCOD({ limit: 100 }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.data && (res.data.cods || res.data.codRecords)) {
          this.records = (res.data.cods || res.data.codRecords).map((c: any) => {
            let uiStatus = 'Pending Remittance';
            if (c.status === 'SETTLED_TO_VEXARO') uiStatus = 'Ready for Release';
            else if (c.status === 'REMITTED') uiStatus = 'Remitted';
            else if (c.status === 'DISPUTED') uiStatus = 'Returned';

            return {
              id: c._id,
              awb: c.shipmentId?.awb || '—',
              merchantName: c.merchantId ? `${c.merchantId.firstName || ''} ${c.merchantId.lastName || ''}`.trim() : '—',
              merchantId: c.merchantId?._id || '',
              amount: c.codAmount,
              status: uiStatus,
              rawStatus: c.status,
              date: new Date(c.collectedAt || c.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            };
          });

          // Calculate summary counts/amounts
          const pendingAmt = this.records.filter(r => r.rawStatus === 'PENDING' || r.rawStatus === 'SETTLED_TO_VEXARO').reduce((s, r) => s + r.amount, 0);
          const remittedAmt = this.records.filter(r => r.rawStatus === 'REMITTED').reduce((s, r) => s + r.amount, 0);
          const returnedAmt = this.records.filter(r => r.rawStatus === 'DISPUTED').reduce((s, r) => s + r.amount, 0);

          this.summary = {
            pending: pendingAmt,
            remitted: remittedAmt,
            returned: returnedAmt
          };
          this.applyFilters();
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load COD records:', err);
      }
    });
  }

  applyFilters() {
    this.filteredRecords = this.records.filter(r => {
      const matchesSearch = r.awb.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            r.merchantName.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'All' ||
                            (this.statusFilter === 'Pending Remittance' && (r.status === 'Pending Remittance' || r.status === 'Ready for Release')) ||
                            r.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  markAsRemitted(record: CODRecord) {
    if (this.userRole === 'SUPER_ADMIN') {
      if (confirm(`Confirm settlement of COD AWB ${record.awb} to Vexaro?`)) {
        this.financeService.remitCOD(record.id).subscribe({
          next: () => {
            alert(`COD for AWB ${record.awb} settled to Vexaro.`);
            this.loadData();
          },
          error: (err) => alert(err.error?.message || 'Failed to settle COD.')
        });
      }
    } else {
      if (confirm(`Release COD AWB ${record.awb} to Merchant's wallet?`)) {
        this.financeService.remitCOD(record.id).subscribe({
          next: () => {
            alert(`COD for AWB ${record.awb} released to Merchant.`);
            this.loadData();
          },
          error: (err) => alert(err.error?.message || 'Failed to release COD.')
        });
      }
    }
  }
}
