import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    // À compléter avec le service d'authentification
    console.log('Formulaire soumis:', this.forgotPasswordForm.value);

    // Simulation de délai pour montrer le spinner
    setTimeout(() => {
      this.isLoading = false;
      this.successMessage =
        'Un e-mail a été envoyé avec les instructions pour réinitialiser votre mot de passe.';
      // Redirection temporaire après quelques secondes
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 3000);
    }, 1500);
  }
}
