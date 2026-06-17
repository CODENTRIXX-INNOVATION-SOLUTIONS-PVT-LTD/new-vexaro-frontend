import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-merchant',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-merchant.html',
  styleUrl: './create-merchant.css'
})
export class CreateMerchant implements OnInit {
  merchantForm!: FormGroup;
  currentStep: number = 1;
  totalSteps: number = 3;
  isSubmitting: boolean = false;

  // Preview of auto-generated IDs
  previewMerchantId: string = '';
  previewWarehouseId: string = '';

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.merchantForm = this.fb.group({
      // Step 1 — Business Info
      businessName: ['', [Validators.required, Validators.minLength(3)]],
      displayName: ['', Validators.required],
      gstin: ['', [Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]],
      pan: ['', [Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]],

      // Step 2 — Contact Info
      contactPerson: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      email: ['', [Validators.required, Validators.email]],
      addressLine1: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],

      // Step 3 — Financial Setup
      creditLimit: [0, [Validators.required, Validators.min(0)]],
      paymentTerms: ['Prepaid', Validators.required],
      initialWalletTopup: [0, [Validators.min(0)]],
    });

    this.generatePreviewIds();
  }

  generatePreviewIds() {
    const timestamp = Date.now().toString().slice(-6);
    this.previewMerchantId = `MRC-${timestamp}`;
    this.previewWarehouseId = `WH-${timestamp}`;
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isStepValid(): boolean {
    if (this.currentStep === 1) {
      return this.merchantForm.get('businessName')?.valid === true &&
             this.merchantForm.get('displayName')?.valid === true;
    }
    if (this.currentStep === 2) {
      return this.merchantForm.get('contactPerson')?.valid === true &&
             this.merchantForm.get('phone')?.valid === true &&
             this.merchantForm.get('email')?.valid === true &&
             this.merchantForm.get('city')?.valid === true &&
             this.merchantForm.get('state')?.valid === true &&
             this.merchantForm.get('pincode')?.valid === true;
    }
    return true;
  }

  submitMerchant() {
    if (this.merchantForm.invalid) return;
    this.isSubmitting = true;
    // TODO: API Call
    // POST /distributor/:id/merchants
    // Body: { ...merchantForm.value }
    // Response: { merchantId, warehouseId, loginCredentials }
    console.log('Creating merchant:', this.merchantForm.value);
    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/distributor/merchants']);
    }, 1500);
  }

  cancel() {
    this.router.navigate(['/distributor/merchants']);
  }
}
