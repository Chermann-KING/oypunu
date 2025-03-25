import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: false,
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent implements OnInit {
  isVerifying = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private _route: ActivatedRoute,
    private _authService: AuthService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe((params) => {
      const token = params['token'];
      if (token) {
        this.verifyEmail(token);
      }
    });
  }

  verifyEmail(token: string): void {
    this._authService.verifyEmail(token).subscribe({
      next: (response) => {
        this.isVerifying = false;
        this.successMessage = response.message;
        // Rediriger vers la page de connexion après quelques secondes
        setTimeout(() => {
          this._router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (error) => {
        this.isVerifying = false;
        this.errorMessage = error.message || 'Erreur de vérification';
      },
    });
  }
}
