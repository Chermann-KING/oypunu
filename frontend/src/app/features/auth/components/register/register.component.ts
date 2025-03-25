import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _authService: AuthService
  ) {
    this.registerForm = this._fb.group(
      {
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        nativeLanguage: [''],
        terms: [false, Validators.requiredTrue],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {}

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { username, email, password, nativeLanguage } =
      this.registerForm.value;

    this._authService
      .register(username, email, password, nativeLanguage)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this._router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage =
            error.message || "Une erreur est survenue lors de l'inscription";
        },
      });
  }
}
