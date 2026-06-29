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
      const tokenVal = params["token"] || "";
      this.token.set(tokenVal);

      if (!tokenVal) {
        this.tokenValid.set(false);
        return;
      }

      // Mock verification request: GET /api/auth/verify-invite?token=inviteToken
      this.isLoading.set(true);
      this.tokenValid.set(null); // set loading state
      
      setTimeout(() => {
        this.isLoading.set(false);
        // Simulate validating token
        if (tokenVal === "invalid-token" || tokenVal.length < 5) {
          this.tokenValid.set(false);
        } else {
          this.tokenValid.set(true);
          // Simulate receiving payload from backend
          const isDist = tokenVal.toLowerCase().includes("dist");
          this.inviteeEmail.set(isDist ? "invited-distributor@vexaro.in" : "invited-merchant@vexaro.in");
          this.inviteeRole.set(isDist ? "DISTRIBUTOR" : "MERCHANT");
          this.inviteeName.set(isDist ? "Alex Distributor" : "Sam Merchant");
        }
      }, 1000);
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

    // Mock API Call: POST /api/auth/set-password { token, password }
    setTimeout(() => {
      this.isLoading.set(false);
      this.successMessage.set("Account activated successfully! Redirecting to dashboard...");
      
      setTimeout(() => {
        // Set mock session details
        localStorage.setItem("token", "mock-vexaro-session-token");
        localStorage.setItem("userRole", this.inviteeRole());

        switch (this.inviteeRole()) {
          case "DISTRIBUTOR":
            localStorage.setItem("distributorCredentialsChanged", "true");
            this.router.navigate(["/distributor"]);
            break;
          case "MERCHANT":
            localStorage.setItem("merchantCredentialsChanged", "true");
            this.router.navigate(["/merchant"]);
            break;
          default:
            this.router.navigate(["/login"]);
        }
      }, 1500);
    }, 1200);
  }
}
