import { Component, signal, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-forgot-password",
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"],
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);

  email = "";
  isLoading = signal(false);
  errorMessage = signal("");
  successMessage = signal("");

  onSubmit(): void {
    this.errorMessage.set("");
    this.successMessage.set("");

    if (!this.email.trim()) {
      this.errorMessage.set("Please enter your email address.");
      return;
    }

    this.isLoading.set(true);

    this.authService.forgotPassword(this.email.trim()).subscribe({
      next: () => {
        this.isLoading.set(false);
        // Always show the same neutral message regardless of whether the
        // email exists — avoids user enumeration.
        this.successMessage.set(
          "If an account exists with this email, a password reset link has been sent."
        );
        this.email = "";
      },
      error: (err) => {
        this.isLoading.set(false);
        // Surface a meaningful message if the API returns one, otherwise
        // fall back to the neutral success message so as not to leak info.
        const serverMsg: string = err?.error?.message ?? "";
        if (serverMsg) {
          this.errorMessage.set(serverMsg);
        } else {
          // Treat unknown errors as success to prevent user enumeration
          this.successMessage.set(
            "If an account exists with this email, a password reset link has been sent."
          );
        }
      },
    });
  }
}
