import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-merchant-warehouse',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './merchant-warehouse.html',
  styleUrl: './merchant-warehouse.css',
})
export class MerchantWarehouse {
  // Read-only info
  warehouseId = 'WH-RAJ-462021';
  streetAddress = 'Plot 14, Industrial Area, Near Nadra Bus Stand';
  city = 'Bhopal';
  state = 'Madhya Pradesh';
  pincode = '462021';

  // Editable fields model
  warehouseName = 'Raj Courier Warehouse';
  contactPerson = 'Arun Mehra';
  contactPhone = '9000112233';
  gstNumber = '23AAAAA1111A1Z1';

  // Toast / dialog visibility
  saveSuccess = false;
  showAddressRequestConfirmation = false;

  saveDetails() {
    this.saveSuccess = true;
    setTimeout(() => {
      this.saveSuccess = false;
    }, 3000);
  }

  requestAddressChange() {
    this.showAddressRequestConfirmation = true;
  }

  closeAddressRequest() {
    this.showAddressRequestConfirmation = false;
  }
}
