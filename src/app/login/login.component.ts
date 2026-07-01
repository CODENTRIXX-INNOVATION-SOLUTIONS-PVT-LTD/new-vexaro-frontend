import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../services/auth.service"; // <-- Update the path if needed

@Component({
  selector: "app-login",
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  email = "";
  password = "";
  rememberMe = false;

  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal("");

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    this.errorMessage.set("");

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage.set("Please enter your email and password.");
      return;
    }

    this.isLoading.set(true);

    this.authService.login(this.email.trim(), this.password).subscribe({
      next: (response) => {
        this.isLoading.set(false);

        const data = response.data;

        // Save tokens
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        // Save logged in user
        localStorage.setItem("user", JSON.stringify(data.user));

        // Save role separately (optional)
        localStorage.setItem("userRole", data.user.role);

        // Save redirect path (optional)
        localStorage.setItem("redirectTo", `/${data.redirectTo}/dashboard`);

        // Navigate to the page decided by backend
        this.router.navigate([`/${data.redirectTo}/dashboard`]);
      },

      error: (error) => {
        this.isLoading.set(false);
        console.log(error)
        this.errorMessage.set(
          error?.error?.message || "Invalid email or password."
        );
      },
    });
  }
}