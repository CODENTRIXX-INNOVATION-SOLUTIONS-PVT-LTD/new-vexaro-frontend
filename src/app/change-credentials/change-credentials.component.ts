import { Component, signal } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-change-credentials",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./change-credentials.component.html",
  styleUrls: ["./change-credentials.component.scss"],
})
export class ChangeCredentialsComponent {
  constructor(private router: Router) {}

  newEmail = "";
  newPassword = "";
  confirmPassword = "";

  showPassword = signal(false);
  showConfirm = signal(false);
  isLoading = signal(false);
  errorMessage = signal("");
  successMessage = signal("");

  passwordStrength = signal<"weak" | "fair" | "strong" | "">("");
  passwordStrengthClass = signal("");

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirm(): void {
    this.showConfirm.update((v) => !v);
  }

  checkPasswordStrength(): void {
    const p = this.newPassword;
    if (!p) {
      this.passwordStrength.set("");
      this.passwordStrengthClass.set("");
      return;
    }

    if (p.length < 6) {
      this.passwordStrength.set("weak");
      this.passwordStrengthClass.set("weak");
      return;
    }

    const hasNumber = /[0-9]/.test(p);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(p);
    const hasUpper = /[A-Z]/.test(p);
    const hasLower = /[a-z]/.test(p);

    const criteriaCount = [hasNumber, hasSpecial, hasUpper, hasLower].filter(Boolean).length;

    if (p.length >= 8 && criteriaCount >= 3) {
      this.passwordStrength.set("strong");
      this.passwordStrengthClass.set("strong");
    } else {
      this.passwordStrength.set("fair");
      this.passwordStrengthClass.set("fair");
    }
  }

  onSubmit(): void {
    this.errorMessage.set("");

    if (!this.newEmail || !this.newPassword || !this.confirmPassword) {
      this.errorMessage.set("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newEmail.trim())) {
      this.errorMessage.set("Please enter a valid email address.");
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage.set("New password must be at least 8 characters long.");
      return;
    }

    if (this.passwordStrength() === "weak") {
      this.errorMessage.set("The new password is too weak. Please use numbers, uppercase and lowercase letters.");
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set("Passwords do not match.");
      return;
    }

    this.isLoading.set(true);

    // Mock API Submission (will be wired to POST /api/auth/change-initial-credentials)
    setTimeout(() => {
      this.isLoading.set(false);
      this.successMessage.set("Credentials changed successfully! Redirecting to dashboard...");
      
      setTimeout(() => {
        // Set mock token and role to bypass guard routing for verification
        localStorage.setItem("token", "mock-vexaro-session-token");
        localStorage.setItem("userRole", "SUPER_ADMIN");
        localStorage.setItem("superAdminCredentialsChanged", "true");
        this.router.navigate(["/super-admin/dashboard"]);
      }, 1500);
    }, 1500);
  }
}
