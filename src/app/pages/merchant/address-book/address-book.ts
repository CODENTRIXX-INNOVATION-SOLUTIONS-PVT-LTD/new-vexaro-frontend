import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-address-book',
  imports: [CommonModule, FormsModule],
  templateUrl: './address-book.html',
  styleUrl: './address-book.css',
})
export class AddressBook implements OnInit {
  private http = inject(HttpClient);
  private readonly base = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';

  searchQuery          = signal('');
  showForm             = signal(false);
  isLoading            = signal(false);
  isSaving             = signal(false);
  notificationMessage  = signal<string | null>(null);   // template calls notificationMessage()
  error                = signal('');

  private _addresses: any[] = [];
  page  = 1;
  total = 0;
  readonly limit = 20;
  get totalPages(): number { return Math.ceil(this.total / this.limit) || 1; }

  // Form fields
  name = ''; phone = ''; email = '';
  street = ''; city = ''; state = '';
  pincode = ''; label: 'Home' | 'Office' | 'Store' | 'Warehouse' = 'Home';
  formError = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading.set(true);
    this.error.set('');

    let p = new HttpParams()
      .set('page', this.page.toString())
      .set('pageSize', this.limit.toString());
    const q = this.searchQuery().trim();
    if (q) p = p.set('search', q);

    this.http.get<any>(`${this.base}/users/address-book`, { params: p }).pipe(
      finalize(() => this.isLoading.set(false)),
    ).subscribe({
      next: (res) => {
        this.total       = res?.meta?.total ?? 0;
        this._addresses  = res?.data?.addresses ?? [];
      },
      error: (err) => this.error.set(err?.error?.message || 'Failed to load addresses.'),
    });
  }

  applySearch(): void { this.page = 1; this.load(); }
  prevPage(): void { if (this.page > 1)             { this.page--; this.load(); } }
  nextPage(): void { if (this.page < this.totalPages) { this.page++; this.load(); } }

  // Template uses getFilteredAddresses() method
  getFilteredAddresses(): any[] {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this._addresses;
    return this._addresses.filter(a =>
      (a.name    || '').toLowerCase().includes(q) ||
      (a.city    || '').toLowerCase().includes(q) ||
      (a.state   || '').toLowerCase().includes(q) ||
      (a.pincode || '').toLowerCase().includes(q)
    );
  }

  openForm(): void {
    this.name = ''; this.phone = ''; this.email = '';
    this.street = ''; this.city = ''; this.state = '';
    this.pincode = ''; this.label = 'Home'; this.formError = '';
    this.showForm.set(true);
  }

  saveAddress(): void {
    if (!this.name.trim() || !this.phone.trim() || !this.street.trim() || !this.city.trim() || !this.pincode.trim()) {
      this.formError = 'Name, phone, address, city and pincode are required.';
      return;
    }
    this.isSaving.set(true);
    this.formError = '';

    this.http.post<any>(`${this.base}/users/address-book`, {
      name:        this.name.trim(),
      phone:       this.phone.trim(),
      email:       this.email.trim() || undefined,
      addressLine: this.street.trim(),
      city:        this.city.trim(),
      state:       this.state.trim(),
      pincode:     this.pincode.trim(),
      label:       this.label,
    }).pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        this.showForm.set(false);
        this.load();
        this.toast('Address saved successfully.');
      },
      error: (err) => { this.formError = err?.error?.message || 'Failed to save address.'; },
    });
  }

  deleteAddress(id: string): void {
    if (!confirm('Delete this address?')) return;
    this.http.delete<any>(`${this.base}/users/address-book/${id}`).subscribe({
      next: () => { this.load(); this.toast('Address deleted.'); },
      error: (err) => this.error.set(err?.error?.message || 'Failed to delete address.'),
    });
  }

  private toast(msg: string): void {
    this.notificationMessage.set(msg);
    setTimeout(() => this.notificationMessage.set(null), 3000);
  }
}
