import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-dispute-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dispute-detail.html',
  styleUrl: './dispute-detail.css'
})
export class DisputeDetail implements OnInit {
  disputeId: string = '';
  isLoading: boolean = false;
  isSubmitting: boolean = false;

  dispute: any = {
    id: '',
    awb: '',
    merchantName: '',
    merchantCode: '',
    courier: '',
    status: 'Open',
    appliedWeight: 0,
    chargedWeight: 0,
    weightDifference: 0,
    extraChargeAmount: 0,
    deadlineDate: '',
    hoursLeft: 0,
    productName: '',
    boxDimensions: ''
  };

  remarks: string = '';
  actionType: 'accept' | 'dispute' | null = null;
  uploadedFiles: File[] = [];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.disputeId = this.route.snapshot.paramMap.get('id') || '';
    this.loadDisputeDetails();
  }

  loadDisputeDetails() {
    this.isLoading = true;
    // TODO: GET /distributor/:id/disputes/:disputeId
    this.dispute = {
      id: this.disputeId || 'DIS1001',
      awb: 'AWB554321',
      merchantName: 'Global Traders',
      merchantCode: 'MER002',
      courier: 'Delhivery Standard',
      status: 'Open',
      appliedWeight: 0.5,
      chargedWeight: 1.2,
      weightDifference: 0.7,
      extraChargeAmount: 150,
      deadlineDate: '19 Jun 2026',
      hoursLeft: 36,
      productName: 'Gaming Mouse',
      boxDimensions: '15 x 10 x 5 cm'
    };
    this.isLoading = false;
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.uploadedFiles.push(files[i]);
      }
    }
  }

  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }

  submitAction() {
    if (!this.actionType) return;
    this.isSubmitting = true;
    
    // TODO: 
    // If actionType === 'accept': PUT /disputes/:id/accept
    // If actionType === 'dispute': POST /disputes/:id/evidence (multipart/form-data)
    
    console.log(`Submitting ${this.actionType} with remarks:`, this.remarks);
    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/distributor/disputes']);
    }, 1500);
  }

  goBack() {
    this.router.navigate(['/distributor/disputes']);
  }
}
