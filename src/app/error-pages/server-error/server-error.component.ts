import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="error-container">
      <div class="error-code">500</div>
      <div class="error-content">
        <h1>Internal Server Error</h1>
        <p>Something went wrong on our servers. Please try again later.</p>
        <button routerLink="/" class="btn-home">
          Go back to Dashboard
        </button>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: rgb(250, 250, 247);
      font-family: 'Plus Jakarta Sans', sans-serif;
      text-align: center;
      padding: 24px;
    }
    .error-code {
      font-size: 8rem;
      font-weight: 900;
      color: rgba(11, 74, 111, 0.08);
      line-height: 1;
      margin-bottom: 1rem;
      user-select: none;
    }
    .error-content {
      max-width: 450px;
    }
    .error-content h1 {
      font-size: 24px;
      font-weight: 800;
      color: rgb(10, 10, 10);
      margin: 0 0 12px;
    }
    .error-content p {
      font-size: 15px;
      color: rgba(10, 10, 10, 0.55);
      margin: 0 0 28px;
      line-height: 1.6;
    }
    .btn-home {
      padding: 12px 28px;
      background: rgb(11, 74, 111);
      border: none;
      color: #ffffff;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(11, 74, 111, 0.25);
      transition: all 0.2s;
    }
    .btn-home:hover {
      background: rgb(8, 56, 84);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(11, 74, 111, 0.35);
    }
  `]
})
export class ServerErrorComponent {}
