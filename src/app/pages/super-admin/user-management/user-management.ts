import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Operator" | "Support Agent" | "Auditor";
  status: "Active" | "Inactive";
  joinedDate: string;
}

@Component({
  selector: "app-user-management",
  imports: [CommonModule, FormsModule],
  templateUrl: "./user-management.html",
  styleUrl: "./user-management.css",
})
export class UserManagement {
  searchQuery = signal<string>("");
  roleFilter = signal<string>("ALL");

  users = signal<PlatformUser[]>([
    { id: "USR-001", name: "Aashish Verma", email: "aashish@vexaro.com", role: "Super Admin", status: "Active", joinedDate: "2025-01-10" },
    { id: "USR-002", name: "Ramesh Sharma", email: "ramesh.operator@vexaro.com", role: "Operator", status: "Active", joinedDate: "2025-03-15" },
    { id: "USR-003", name: "Priya Nair", email: "priya.support@vexaro.com", role: "Support Agent", status: "Active", joinedDate: "2025-04-20" },
    { id: "USR-004", name: "John Doe", email: "john.auditor@vexaro.com", role: "Auditor", status: "Inactive", joinedDate: "2025-05-12" },
    { id: "USR-005", name: "Kunal Sen", email: "kunal.ops@vexaro.com", role: "Operator", status: "Active", joinedDate: "2025-06-01" }
  ]);

  // Form management
  showAddForm = signal<boolean>(false);
  newUserName = "";
  newUserEmail = "";
  newUserRole: "Super Admin" | "Operator" | "Support Agent" | "Auditor" = "Operator";

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
    this.users.update(allUsers => {
      return allUsers.map(u => {
        if (u.id === user.id) {
          const nextStatus = u.status === "Active" ? "Inactive" : "Active";
          return { ...u, status: nextStatus };
        }
        return u;
      });
    });
    
    const updatedUser = this.users().find(u => u.id === user.id);
    this.showNotification(`User status changed to ${updatedUser?.status}.`);
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
    this.newUserRole = "Operator";
    this.showAddForm.set(false);

    this.showNotification("New staff user added successfully.");
  }
}
