import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { SettingsService } from '../../../../services/settings.service';

export interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  createdAt: string;
  lastUsedAt: string | null;
  status: string;
}

@Component({
  selector: 'app-settings-api',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './api-settings.html',
  styleUrl: './api-settings.css'
})
export class ApiSettings implements OnInit, OnDestroy {
  private settingsService = inject(SettingsService);
  private destroy$ = new Subject<void>();

  apiKeys: ApiKey[] = [];
  isLoading = false;
  isCreating = false;
  isRevoking: string | null = null; // tracks which key id is being revoked

  newKeyName = '';
  showCreateForm = false;
  createError = '';
  newKeySecret: string | null = null; // shown once after creation

  ngOnInit() {
    this.loadApiKeys();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadApiKeys() {
    this.isLoading = true;
    this.settingsService.getApiKeys()
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isLoading = false; }))
      .subscribe({
        next: (res) => {
          const raw: any[] = res?.data?.apiKeys ?? res?.data ?? [];
          this.apiKeys = raw.map((k: any) => ({
            id: k._id ?? k.id,
            name: k.name,
            keyPreview: k.keyPreview ?? k.key ?? '••••••••',
            createdAt: k.createdAt
              ? new Date(k.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
              : '—',
            lastUsedAt: k.lastUsedAt
              ? new Date(k.lastUsedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
              : null,
            status: k.isActive === false ? 'Revoked' : 'Active',
          }));
        },
        error: () => { this.apiKeys = []; }
      });
  }

  openCreateForm() {
    this.showCreateForm = true;
    this.newKeyName = '';
    this.createError = '';
    this.newKeySecret = null;
  }

  cancelCreate() {
    this.showCreateForm = false;
    this.newKeyName = '';
    this.createError = '';
    this.newKeySecret = null;
  }

  generateNewKey() {
    if (!this.newKeyName.trim()) {
      this.createError = 'Key name is required.';
      return;
    }
    this.isCreating = true;
    this.createError = '';
    this.settingsService.createApiKey({ name: this.newKeyName.trim() })
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isCreating = false; }))
      .subscribe({
        next: (res) => {
          // Backend returns the full key only once on creation
          this.newKeySecret = res?.data?.key ?? res?.data?.apiKey ?? null;
          this.newKeyName = '';
          this.loadApiKeys();
        },
        error: (err) => {
          this.createError = err?.error?.message ?? 'Failed to generate API key.';
        }
      });
  }

  revokeKey(id: string) {
    if (!confirm('Are you sure you want to revoke this API key? This cannot be undone.')) return;
    this.isRevoking = id;
    this.settingsService.revokeApiKey(id)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.isRevoking = null; }))
      .subscribe({
        next: () => { this.loadApiKeys(); },
        error: (err) => { alert(err?.error?.message ?? 'Failed to revoke key.'); }
      });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // silent success — could add a toast here
    }).catch(() => {
      alert('Could not copy to clipboard.');
    });
  }
}
