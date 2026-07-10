import { Component, signal, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { UserService } from "../../../services/user.service";
import { RouterModule } from "@angular/router";
import { PaginationComponent } from "../../../shared/pagination/pagination";

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Distributor" | "Merchant";
  status: "Active" | "Inactive";
  joinedDate: string;
}

@Component({
  selector: "app-user-management",
  imports: [CommonModule, FormsModule, RouterModule, PaginationComponent],
  templateUrl: "./user-management.html",
  styleUrl: "./user-management.css",
})
export class UserManagement implements OnInit {
  private userService = inject(UserService);

  searchQuery = signal<string>("");
  roleFilter = signal<string>("ALL");

  users = signal<PlatformUser[]>([]);
  page = signal<number>(1);
  readonly limit = 20;
  total = signal<number>(0);

  get totalPages(): number { return Math.ceil(this.total() / this.limit) || 1; }

  // Form management
  showAddForm = signal<boolean>(false);
  newUserName = "";
  newUserEmail = "";
  newUserRole: "Super Admin" | "Distributor" | "Merchant" = "Merchant";

  notificationMessage = signal<string | null>(null);

  showNotification(msg: string) {
    this.notificationMessage.set(msg);
    setTimeout(() => {
      this.notificationMessage.set(null);
    }, 3000);
  }

  getFilteredUsers() {
    const query = this.searchQuery().toLowerCase().trim();
    const role = this.roleFilter();

    return this.users().filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query) || u.id.toLowerCase().includes(query);
      const matchesRole = role === "ALL" || u.role === role;
      return matchesSearch && matchesRole;
    });
  }

  toggleUserStatus(user: PlatformUser) {
    const shouldActivate = user.status !== 'Active';

    const request = shouldActivate
      ? this.userService.reactivateUser(user.id)
      : this.userService.deactivateUser(user.id);

    request.subscribe({
      next: () => {
        this.users.update(allUsers => {
          return allUsers.map(u => {
            if (u.id === user.id) {
              return { ...u, status: shouldActivate ? 'Active' : 'Inactive' };
            }
            return u;
          });
        });

        this.showNotification(`User status changed to ${shouldActivate ? 'Active' : 'Inactive'}.`);
      },
      error: (err) => {
        console.error('Error toggling user status:', err);
        this.showNotification('Unable to update user status. Please try again.');
      }
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  private getRoleLabel(role: string): PlatformUser['role'] {
    const map: Record<string, PlatformUser['role']> = {
      SUPER_ADMIN: 'Super Admin',
      DISTRIBUTOR: 'Distributor',
      MERCHANT: 'Merchant',
      'Super Admin': 'Super Admin',
      Distributor: 'Distributor',
      Merchant: 'Merchant',
    };

    return map[role] ?? 'Merchant';
  }

  private loadUsers() {
    const role = ['Distributor', 'Merchant'].includes(this.roleFilter()) ? this.toApiRole(this.roleFilter()) : undefined;
    this.userService.listUsers({
      page: this.page(),
      limit: this.limit,
      role,
      search: this.searchQuery().trim() || undefined,
    }).subscribe({
      next: (res) => {

        const items = Array.isArray(res?.data?.users)
          ? res.data.users
          : Array.isArray(res?.items)
            ? res.items
            : [];

        this.total.set(res?.meta?.total ?? items.length);
        this.users.set(items.map((user: any) => ({
          id: String(user.id || user._id || ''),
          name: user.companyName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown User',
          email: user.email || '',
          role: this.getRoleLabel(user.role),
          status: user.isActive ? 'Active' : 'Inactive',
          joinedDate: user.createdAt ? this.formatDateTime(user.createdAt) : ''
        })));
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.showNotification('Unable to load users from the server.');
      }
    });
  }

  applyFilters() {
    this.page.set(1);
    this.loadUsers();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.page()) return;
    this.page.set(page);
    this.loadUsers();
  }

  private toApiRole(role: string): string {
    const map: Record<string, string> = {
      'Super Admin': 'SUPER_ADMIN',
      Distributor: 'DISTRIBUTOR',
      Merchant: 'MERCHANT',
    };
    return map[role] ?? role;
  }

  private formatDateTime(value: string): string {
    return new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  addUser() {
    if (!this.newUserName.trim() || !this.newUserEmail.trim()) {
      return;
    }

    const newId = `USR-0${this.users().length + 1}`;
    const newUser: PlatformUser = {
      id: newId,
      name: this.newUserName,
      email: this.newUserEmail,
      role: this.newUserRole,
      status: "Active",
      joinedDate: this.formatDateTime(new Date().toISOString())
    };

    this.users.update(all => [newUser, ...all]);

    // Clear forms
    this.newUserName = "";
    this.newUserEmail = "";
    this.newUserRole = "Merchant";
    this.showAddForm.set(false);

    this.showNotification("New user registered successfully.");
  }
}
