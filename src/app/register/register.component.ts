import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { getUserFriendlyError } from '../shared/user-facing-error';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, TitleCasePipe],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {}

  inviteeName  = signal('');
  inviteeRole  = signal('');
  inviteeEmail = signal('');
  token        = signal('');

  // null = verifying, true = valid, false = invalid/expired
  tokenValid = signal<boolean | null>(null);

  password        = '';
  confirmPassword = '';
  showPassword    = signal(false);
  showConfirm     = signal(false);
  isLoading       = signal(false);
  errorMessage    = signal('');
  successMessage  = signal('');

  private readonly roleLabels: Record<string, string> = {
    DISTRIBUTOR: 'Distributor',
    MERCHANT:    'Merchant',
  };

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

  get roleLabel(): string {
    return this.roleLabels[this.inviteeRole()] ?? this.inviteeRole();
  }

  get passwordStrength(): 'weak' | 'fair' | 'strong' | '' {
    const p = this.password;
    if (!p) return '';
    return this.getPasswordErrors(p).length ? 'weak' : 'strong';
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const tokenVal = params['token'] || '';
      this.token.set(tokenVal);

      // No token in URL — show "invalid link" state immediately
      if (!tokenVal) {
        this.tokenValid.set(false);
        return;
      }

      // Verify token with backend
      this.isLoading.set(true);
      this.tokenValid.set(null);

      this.authService.verifyInvite(tokenVal).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.tokenValid.set(true);

          const data = res.data;
          this.inviteeEmail.set(data.email   ?? '');
          this.inviteeRole.set(data.role     ?? '');
          this.inviteeName.set(data.name     ?? '');
        },
        error: (err) => {
          this.isLoading.set(false);
          this.tokenValid.set(false);
          this.errorMessage.set(getUserFriendlyError(err, 'This invite link is invalid or has expired.'));
        },
      });
    });
  }

  togglePassword(): void { this.showPassword.update((v) => !v); }
  toggleConfirm():  void { this.showConfirm.update((v)  => !v); }

  onSubmit(): void {
    this.errorMessage.set('');

    if (!this.password || !this.confirmPassword) {
      this.errorMessage.set('Please enter and confirm your password.');
      return;
    }
    const passwordErrors = this.getPasswordErrors(this.password);
    if (passwordErrors.length) {
      this.errorMessage.set(`Please update your password: ${passwordErrors.join(', ')}.`);
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('The two passwords do not match. Please type the same password in both fields.');
      return;
    }

    this.isLoading.set(true);

    this.authService.setPassword(this.token(), this.password).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set('Your account is ready. We are taking you to your dashboard.');

        const data = res.data;

        // ── Persist session (sessionStorage by default — same as login without rememberMe) ──
        // Use localStorage only if the user will later choose "remember me" on the login page.
        // On set-password we always use sessionStorage for consistency.
        const storage = sessionStorage;
        if (data.accessToken)  storage.setItem('accessToken',  data.accessToken);
        if (data.refreshToken) storage.setItem('refreshToken', data.refreshToken);
        if (data.user) {
          storage.setItem('user',     JSON.stringify(data.user));
          storage.setItem('userRole', data.user.role ?? '');
        }

        // ── Navigate to the correct dashboard ─────────────────────────────────
        setTimeout(() => {
          // Backend returns redirectTo like '/merchant' or '/distributor'
          const role = data.user?.role ?? '';

          if (data.redirectTo) {
            // Normalise leading slash and append /dashboard
            const segment = (data.redirectTo as string).replace(/^\/+/, '');
            this.router.navigate([`/${segment}/dashboard`]);
            return;
          }

          // Fallback by role
          switch (role) {
            case 'DISTRIBUTOR': this.router.navigate(['/distributor/dashboard']); break;
            case 'MERCHANT':    this.router.navigate(['/merchant/dashboard']);    break;
            default:            this.router.navigate(['/login']);
          }
        }, 1500);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(getUserFriendlyError(err, 'Please choose a stronger password and try again.'));
      },
    });
  }
}
