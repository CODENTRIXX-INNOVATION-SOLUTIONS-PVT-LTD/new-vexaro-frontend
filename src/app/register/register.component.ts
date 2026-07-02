import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TitleCasePipe } from "@angular/common";
import { Router, RouterLink, ActivatedRoute } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [FormsModule, RouterLink, TitleCasePipe],
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  inviteeName = signal("");
  inviteeRole = signal("");
  inviteeEmail = signal("");
  token = signal("");
  tokenValid = signal<boolean | null>(null);

  password = "";
  confirmPassword = "";
  showPassword = signal(false);
  showConfirm = signal(false);
  isLoading = signal(false);
  errorMessage = signal("");
  successMessage = signal("");

  private readonly roleLabels: Record<string, string> = {
    DISTRIBUTOR: "Distributor",
    MERCHANT: "Merchant",
  };

  get roleLabel(): string {
    return this.roleLabels[this.inviteeRole()] ?? this.inviteeRole();
  }

  get passwordStrength(): "weak" | "fair" | "strong" | "" {
    const p = this.password;
    if (!p) return "";
    const score = [
      /[A-Z]/.test(p),
      /[a-z]/.test(p),
      /[0-9]/.test(p),
      /[^A-Za-z0-9]/.test(p),
      p.length >= 8,
    ].filter(Boolean).length;
    if (score <= 2) return "weak";
    if (score <= 3) return "fair";
    return "strong";
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const tokenVal = params["token"] || "";
      this.token.set(tokenVal);

      if (!tokenVal) {
        this.tokenValid.set(false);
        return;
      }

      this.isLoading.set(true);
      this.tokenValid.set(null);

      this.authService.verifyInvite(tokenVal).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.tokenValid.set(true);

          const data = res.data;
          this.inviteeEmail.set(data.email);
          this.inviteeRole.set(data.role);
          this.inviteeName.set(data.name);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.tokenValid.set(false);
          console.error("Verify Invite Error:", err);
        }
      });
    });
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }
  toggleConfirm(): void {
    this.showConfirm.update((v) => !v);
  }

  onSubmit(): void {
    this.errorMessage.set("");
    if (!this.password || !this.confirmPassword) {
      this.errorMessage.set("Please enter and confirm your password.");
      return;
    }
    if (this.password.length < 8) {
      this.errorMessage.set("Password must be at least 8 characters.");
      return;
    }
    if (this.passwordStrength === "weak") {
      this.errorMessage.set("Please choose a stronger password.");
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage.set("Passwords do not match.");
      return;
    }

    this.isLoading.set(true);

    this.authService.setPassword(this.token(), this.password).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set("Account activated successfully! Redirecting to dashboard...");

        const data = res.data;
        // The API returns accessToken and refreshToken on set-password
        if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
        if (data.user?.role) localStorage.setItem("userRole", data.user.role);

        setTimeout(() => {
          if (data.redirectTo) {
            this.router.navigate([data.redirectTo]);
          } else {
            // Fallback routing
            switch (data.user?.role) {
              case "DISTRIBUTOR":
                this.router.navigate(["/distributor"]);
                break;
              case "MERCHANT":
                this.router.navigate(["/merchant"]);
                break;
              default:
                this.router.navigate(["/login"]);
            }
          }
        }, 1500);
      },
      error: (err) => {
        this.isLoading.set(false);
        let errorMsg = err.error?.message || "An error occurred while setting the password.";
        if (err.error?.errors && Array.isArray(err.error.errors)) {
          errorMsg = err.error.errors.map((e: any) => `${e.field}: ${e.message}`).join(' | ');
        }
        this.errorMessage.set(errorMsg);
        console.error("Set Password Error:", err.error);
      }
    });
  }
}
