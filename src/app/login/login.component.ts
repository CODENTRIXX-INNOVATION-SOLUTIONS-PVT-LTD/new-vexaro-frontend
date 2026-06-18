import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  constructor(private router: Router) {}

  email = "";
  password = "";
  rememberMe = false;
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal("");

  private readonly fakeUsers = [
    { email: "admin@vexaro.in", password: "Admin@123", role: "SUPER_ADMIN" },
    { email: "dist1@vexaro.in", password: "Dist@123", role: "DISTRIBUTOR" },
    { email: "merchant1@vexaro.in", password: "Merch@123", role: "MERCHANT" },
  ];

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    this.errorMessage.set("");
    if (!this.email || !this.password) {
      this.errorMessage.set("Please enter your email and password.");
      return;
    }

    this.isLoading.set(true);

    setTimeout(() => {
      const user = this.fakeUsers.find(
        (u) =>
          u.email === this.email.trim().toLowerCase() &&
          u.password === this.password,
      );
      this.isLoading.set(false);

      if (!user) {
        this.errorMessage.set("Invalid email or password. Please try again.");
        return;
      }

      switch (user.role) {
        case "SUPER_ADMIN":
          this.router.navigate(["/super-admin"]);
          break;
        case "DISTRIBUTOR":
          this.router.navigate(["/distributor"]);
          break;
        case "MERCHANT":
          this.router.navigate(["/merchant"]);
          break;
        default:
          this.router.navigate(["/login"]);
      }
    }, 900);
  }
}
