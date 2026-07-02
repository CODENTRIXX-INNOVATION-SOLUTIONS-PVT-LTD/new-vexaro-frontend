import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-distributor-created-success',
  imports: [],
  templateUrl: './distributor-created-success.html',
  styleUrl: './distributor-created-success.css'
})
export class DistributorCreatedSuccess {

  @Output() close = new EventEmitter<void>();

  username = 'speedimax001';
  password = 'Vref@12345';

  closeModal() {
    this.close.emit();
  }

  copyText(text: string) {
    navigator.clipboard.writeText(text);
  }
}