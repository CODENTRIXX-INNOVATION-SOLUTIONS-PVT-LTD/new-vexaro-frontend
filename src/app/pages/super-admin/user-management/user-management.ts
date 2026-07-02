import { Component, signal, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { UserService } from "../../../services/user.service";
import { RouterModule } from "@angular/router";

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
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./user-management.html",
  styleUrl: "./user-management.css",
})
export class UserManagement implements OnInit {
  private userService = inject(UserService);

  searchQuery = signal<string>("");
  roleFilter = signal<string>("ALL");

  users = signal<PlatformUser[]>([]);

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
    this.userService.listUsers({ page: 1, limit: 100 }).subscribe({
      next: (res) => {

        const items = Array.isArray(res?.data?.users)
          ? res.data.users
          : Array.isArray(res?.items)
            ? res.items
            : [];

        this.users.set(items.map((user: any) => ({
          id: String(user.id || user._id || ''),
          name: user.companyName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown User',
          email: user.email || '',
          role: this.getRoleLabel(user.role),
          status: user.isActive ? 'Active' : 'Inactive',
          joinedDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : ''
        })));
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.showNotification('Unable to load users from the server.');
      }
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
      joinedDate: new Date().toISOString().split("T")[0]
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
