import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);

  token = signal('');
  newPassword = '';
  confirmPassword = '';

  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  passwordStrength = signal<'weak' | 'fair' | 'strong' | ''>('');
  passwordStrengthClass = signal('');
  passwordMismatch = signal(false);

  isLoading = signal(false);
  success = signal(false);
  errorMessage = signal('');
  countdown = signal(5);

  // True when the token is missing or clearly invalid before we even submit
  invalidToken = signal(false);

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const t = params['token'] ?? '';
        this.token.set(t);
        if (!t) {
          this.invalidToken.set(true);
        }
      });
  }

  checkPasswordStrength(pass: string): void {
    this.passwordMismatch.set(false);
    if (!pass) {
      this.passwordStrength.set('');
      this.passwordStrengthClass.set('');
      return;
    }

    if (pass.length < 6) {
      this.passwordStrength.set('weak');
      this.passwordStrengthClass.set('weak');
    } else {
      const hasNumber = /[0-9]/.test(pass);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
      const hasUpper = /[A-Z]/.test(pass);
      const hasLower = /[a-z]/.test(pass);

      if (pass.length >= 8 && hasNumber && hasSpecial && hasUpper && hasLower) {
        this.passwordStrength.set('strong');
        this.passwordStrengthClass.set('strong');
      } else {
        this.passwordStrength.set('fair');
        this.passwordStrengthClass.set('fair');
      }
    }
  }

  toggleNewPassword(): void {
    this.showNewPassword.update(v => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(v => !v);
  }

  onSubmit(): void {
    this.errorMessage.set('');
    this.passwordMismatch.set(false);

    if (this.newPassword !== this.confirmPassword) {
      this.passwordMismatch.set(true);
      return;
    }

    if (this.passwordStrength() === 'weak' || !this.newPassword) {
      return;
    }

    this.isLoading.set(true);

    this.authService.resetPassword(this.token(), this.newPassword).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.set(true);
        this.startCountdown();
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg: string = err?.error?.message ?? '';
        if (msg) {
          this.errorMessage.set(msg);
        } else if (err?.status === 400 || err?.status === 401) {
          this.errorMessage.set('This reset link is invalid or has expired. Please request a new one.');
        } else {
          this.errorMessage.set('Something went wrong. Please try again.');
        }
      },
    });
  }

  private startCountdown(): void {
    const interval = setInterval(() => {
      this.countdown.update(c => {
        if (c <= 1) {
          clearInterval(interval);
          this.router.navigate(['/login']);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }
}
