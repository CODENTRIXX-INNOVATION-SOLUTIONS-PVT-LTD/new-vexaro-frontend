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
        const storage = this.rememberMe ? localStorage : sessionStorage;
        storage.setItem("accessToken", data.accessToken);
        storage.setItem("refreshToken", data.refreshToken);
        storage.setItem("user", JSON.stringify(data.user));
        storage.setItem("userRole", data.user.role);

        // mustChangeCredentials: redirect to the first-login setup page
        if (data.mustChangeCredentials) {
          this.router.navigate(['/change-credentials']);
          return;
        }

        // redirectTo may come with a leading slash (e.g. '/super-admin') — normalise it
        const redirectSegment = (data.redirectTo as string).replace(/^\/+/, '');
        this.router.navigate([`/${redirectSegment}/dashboard`]);
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