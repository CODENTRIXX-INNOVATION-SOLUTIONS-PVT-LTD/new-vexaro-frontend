import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-distributor-created-success',
  imports: [],
  templateUrl: './distributor-created-success.html',
  styleUrl: './distributor-created-success.css'
})
export class DistributorCreatedSuccess {

  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }

}