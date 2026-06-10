import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';

  showPassword = signal(false);
  selectedRole = signal('super-admin');

  roles = [
    { value: 'super-admin', label: 'Super Admin' },
    { value: 'merchant', label: 'Merchant' },
    { value: 'distributor', label: 'Distributor' },
    { value: 'warehouse', label: 'Warehouse' },
  ];

  constructor(private router: Router) {}

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  selectRole(role: string): void {
    this.selectedRole.set(role);
  }

  onRegister(): void {
    if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
      alert('Please fill in all required fields');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const role = this.selectedRole();
    switch (role) {
      case 'super-admin':
        this.router.navigate(['/super-admin']);
        break;
      case 'merchant':
        this.router.navigate(['/merchant']);
        break;
      case 'distributor':
        this.router.navigate(['/distributor']);
        break;
      case 'warehouse':
        this.router.navigate(['/warehouse']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}
