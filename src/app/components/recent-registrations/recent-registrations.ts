import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

interface RegistrationRow {
  id: string;
  name: string;
  role: string;
  email: string;
  date: string;
}

@Component({
  selector: 'app-recent-registrations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-registrations.html',
  styleUrl: '../../common-css/super-admin-dashboard-page-bottom-table.css'
})
export class RecentRegistrations implements OnInit {
  private userService = inject(UserService);

  registrations = signal<RegistrationRow[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  ngOnInit(): void {
    this.userService.listUsers({ limit: 5, page: 1 }).subscribe({
      next: (res) => {
        const users = res?.data?.users ?? [];
        this.registrations.set(users.map((u: any) => ({
          id: u._id?.substring(0, 8) || '—',
          name: u.companyName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown',
          role: u.role || 'User',
          email: u.email || '—',
          date: u.createdAt
            ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
              })
            : '—',
        })));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('[RecentRegistrations] API error:', err);
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}