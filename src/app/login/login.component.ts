import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = true;
  showPassword = signal(false);
  selectedRole = signal('super-admin');

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  selectRole(role: string): void {
    this.selectedRole.set(role);
  }

  onSubmit(): void {
    // login logic placeholder
  }
}
