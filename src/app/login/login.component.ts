import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  constructor(private router: Router) {}
  email = '';
  password = '';
  rememberMe = true;

  showPassword = signal(false);
  selectedRole = signal('super-admin');

  fakeUsers = [
    {
      email: 'admin@test.com',
      password: '123',
      role: 'SUPER_ADMIN'
    },
    {
      email: 'merchant@test.com',
      password: '123',
      role: 'MERCHANT'
    },
    {
      email: 'distributor@test.com',
      password: '123',
      role: 'DISTRIBUTOR'
    },
    {
      email: 'warehouse@test.com',
      password: '123',
      role: 'WAREHOUSE'
    }
  ];

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  selectRole(role: string): void {
    this.selectedRole.set(role);
  }

  onSubmit(): void {
    const user = this.fakeUsers.find(
      u =>
        u.email === this.email &&
        u.password === this.password &&
        u.role === this.selectedRole().toUpperCase().replace('-', '_')
    );

    if (user) {
      console.log('Login Success:', user);

      switch (user.role) {
        case 'SUPER_ADMIN':
         this.router.navigate(['/super-admin']);
          break;

        case 'MERCHANT':
         this.router.navigate(['/merchant']);
          break;

        case 'DISTRIBUTOR':
          this.router.navigate(['/distributor']);
          break;

        case 'WAREHOUSE':
           this.router.navigate(['/warehouse']);
          break;
      }
    } else {
      alert('Invalid Credentials');
    }
  }
}