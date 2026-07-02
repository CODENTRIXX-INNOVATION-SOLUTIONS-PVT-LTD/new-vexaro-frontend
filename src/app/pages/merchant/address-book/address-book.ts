import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

interface ContactAddress {
  id: string;
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  label: "Home" | "Office" | "Store" | "Warehouse";
}

@Component({
  selector: "app-address-book",
  imports: [CommonModule, FormsModule],
  templateUrl: "./address-book.html",
  styleUrl: "./address-book.css",
})
export class AddressBook {
  searchQuery = signal<string>("");
  showForm = signal<boolean>(false);

  addresses = signal<ContactAddress[]>([
    { id: "ADD-001", name: "Rajesh Kumar", phone: "9876543210", email: "rajesh@gmail.com", street: "12, MG Road, Sector 4", city: "Bengaluru", state: "Karnataka", pincode: "560001", label: "Home" },
    { id: "ADD-002", name: "Sharma Traders", phone: "9123456789", email: "sharma@traders.com", street: "45, GIDC Industrial Estate", city: "Surat", state: "Gujarat", pincode: "395003", label: "Warehouse" },
    { id: "ADD-003", name: "Aarav Mehta", phone: "8899001122", email: "aarav@mehta.com", street: "Flat 402, Sunshine Heights", city: "Mumbai", state: "Maharashtra", pincode: "400012", label: "Office" },
    { id: "ADD-004", name: "Modern Retail Store", phone: "7766554433", email: "orders@modernretail.in", street: "Shop No. 7, Central Mall", city: "Delhi", state: "Delhi", pincode: "110001", label: "Store" }
  ]);

  // Form fields
  name = "";
  phone = "";
  email = "";
  street = "";
  city = "";
  state = "";
  pincode = "";
  label: "Home" | "Office" | "Store" | "Warehouse" = "Home";

  notificationMessage = signal<string | null>(null);

  showNotification(msg: string) {
    this.notificationMessage.set(msg);
    setTimeout(() => {
      this.notificationMessage.set(null);
    }, 3000);
  }

  getFilteredAddresses() {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.addresses();

    return this.addresses().filter(a => {
      return (
        a.name.toLowerCase().includes(query) ||
        a.phone.includes(query) ||
        a.city.toLowerCase().includes(query) ||
        a.state.toLowerCase().includes(query) ||
        a.pincode.includes(query)
      );
    });
  }

  saveAddress() {
    if (!this.name.trim() || !this.phone.trim() || !this.street.trim() || !this.city.trim() || !this.pincode.trim()) {
      return;
    }

    const newId = `ADD-0${this.addresses().length + 1}`;
    const newAddress: ContactAddress = {
      id: newId,
      name: this.name,
      phone: this.phone,
      email: this.email,
      street: this.street,
      city: this.city,
      state: this.state,
      pincode: this.pincode,
      label: this.label
    };

    this.addresses.update(prev => [newAddress, ...prev]);

    // Reset fields
    this.name = "";
    this.phone = "";
    this.email = "";
    this.street = "";
    this.city = "";
    this.state = "";
    this.pincode = "";
    this.label = "Home";
    this.showForm.set(false);

    this.showNotification("Address added successfully to your Address Book.");
  }

  deleteAddress(id: string) {
    this.addresses.update(prev => prev.filter(a => a.id !== id));
    this.showNotification("Contact address removed from your Address Book.");
  }
}
