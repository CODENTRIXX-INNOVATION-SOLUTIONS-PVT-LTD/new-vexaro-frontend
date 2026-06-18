import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TitleCasePipe } from "@angular/common";
import { Router, RouterLink, ActivatedRoute } from "@angular/router";

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
  ) {}

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
      this.token.set(params["token"] ?? "");
      this.inviteeName.set(
        params["name"] ? decodeURIComponent(params["name"]) : "",
      );
      this.inviteeRole.set(params["role"] ?? "");
      this.inviteeEmail.set(
        params["email"] ? decodeURIComponent(params["email"]) : "",
      );

      if (this.token()) {
        setTimeout(() => this.tokenValid.set(true), 600);
      } else {
        this.tokenValid.set(false);
      }
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
    if (this.password !== this.confirmPassword) {
      this.errorMessage.set("Passwords do not match.");
      return;
    }

    this.isLoading.set(true);

    // Replace with real API: POST /api/v1/auth/set-password { token, password }
    setTimeout(() => {
      this.isLoading.set(false);
      this.successMessage.set("Password set! Redirecting to your dashboard…");
      setTimeout(() => {
        switch (this.inviteeRole()) {
          case "DISTRIBUTOR":
            this.router.navigate(["/distributor"]);
            break;
          case "MERCHANT":
            this.router.navigate(["/merchant"]);
            break;
          default:
            this.router.navigate(["/login"]);
        }
      }, 1800);
    }, 1000);
  }
}
