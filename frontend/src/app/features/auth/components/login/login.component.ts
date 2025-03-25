import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _router: Router
  ) {
    this.loginForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
    });
  }

  ngOnInit(): void {
    // Vérifier si l'utilisateur est déjà connecté
    if (this._authService.isAuthenticated()) {
      this._router.navigate(['/']);
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this._authService.login(email, password).subscribe({
      next: () => {
        this.isSubmitting = false;
        this._router.navigate(['/']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage =
          error.message || 'Une erreur est survenue lors de la connexion';
      },
    });
  }
}
