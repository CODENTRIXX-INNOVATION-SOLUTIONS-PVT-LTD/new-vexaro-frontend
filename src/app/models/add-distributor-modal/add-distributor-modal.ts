import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-add-distributor-modal',
  imports: [],
  templateUrl: './add-distributor-modal.html',
  styleUrl: './add-distributor-modal.css'
})
export class AddDistributorModal {

  @Output() close = new EventEmitter<void>();

  @Output() distributorSaved = new EventEmitter<void>();

  saveDistributor() {

    // API Call Here

    // After successful save
    this.distributorSaved.emit();

    // Optional: close current modal
    this.close.emit();
  }

  closeModal() {
    this.close.emit();
  }
}