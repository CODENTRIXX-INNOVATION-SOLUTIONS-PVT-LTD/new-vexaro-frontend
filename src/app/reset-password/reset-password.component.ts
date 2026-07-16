import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../services/auth.service';
import { getUserFriendlyError } from '../shared/user-facing-error';

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

  private getPasswordErrors(password: string): string[] {
    const errors: string[] = [];
    if (password.length < 12) errors.push('make it at least 12 characters long');
    if (!/[A-Z]/.test(password)) errors.push('add one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('add one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('add one number');
    if (!/[^A-Za-z0-9\s]/.test(password)) errors.push('add one symbol, such as @, #, or !');
    if (/\s/.test(password)) errors.push('remove any spaces');
    return errors;
  }

  get passwordValid(): boolean {
    return this.newPassword.length > 0 && this.getPasswordErrors(this.newPassword).length === 0;
  }

  passwordHelpText(): string {
    if (!this.newPassword) {
      return '';
    }

    const errors = this.getPasswordErrors(this.newPassword);
    if (!errors.length) {
      return 'Password looks good.';
    }

    return `Please ${errors.join(', ')}.`;
  }

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

    const errors = this.getPasswordErrors(pass);
    if (errors.length) {
      this.passwordStrength.set('weak');
      this.passwordStrengthClass.set('weak');
      return;
    }

    this.passwordStrength.set('strong');
    this.passwordStrengthClass.set('strong');
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

    const passwordErrors = this.getPasswordErrors(this.newPassword);
    if (passwordErrors.length) {
      this.errorMessage.set(`Please update your password: ${passwordErrors.join(', ')}.`);
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
        const fallback = err?.status === 400 || err?.status === 401
          ? 'This reset link is invalid, expired, or already used. Please request a new link.'
          : 'We could not update your password right now. Please try again in a moment.';
        this.errorMessage.set(getUserFriendlyError(err, fallback));
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
