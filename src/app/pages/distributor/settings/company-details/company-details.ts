import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-details.html',
  styleUrl: './company-details.css'
})
export class CompanyDetails {
  // Company details management is not available for distributors.
  // Contact Super Admin to update your company information.
}
