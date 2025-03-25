import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _API_URL = `${environment.apiUrl}/auth`;
  private _currentUserSubject = new BehaviorSubject<User | null>(null);

  currentUser$ = this._currentUserSubject.asObservable();

  constructor(private _http: HttpClient, private _router: Router) {
    this._loadUserFromStorage();
  }

  private _loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      this._currentUserSubject.next(JSON.parse(user));
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this._http
      .post<AuthResponse>(`${this._API_URL}/login`, { email, password })
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.tokens.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this._currentUserSubject.next(response.user);
        }),
        catchError((error) => {
          console.error('Login error:', error);
          return throwError(
            () => new Error(error.error?.message || 'Identification échouée')
          );
        })
      );
  }

  register(
    username: string,
    email: string,
    password: string,
    nativeLanguage?: string
  ): Observable<AuthResponse> {
    return this._http
      .post<AuthResponse>(`${this._API_URL}/register`, {
        username,
        email,
        password,
        nativeLanguage,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.tokens.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this._currentUserSubject.next(response.user);
        }),
        catchError((error) => {
          console.error('Registration error:', error);
          return throwError(
            () =>
              new Error(
                error.error?.message ||
                  "Une erreur est survenue lors de l'inscription"
              )
          );
        })
      );
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this._http
      .get<{ message: string }>(`${this._API_URL}/verify-email/${token}`)
      .pipe(
        catchError((error) => {
          console.error('Email verification error:', error);
          return throwError(
            () =>
              new Error(
                error.error?.message || "Erreur de vérification d'email"
              )
          );
        })
      );
  }

  resendVerificationEmail(email: string): Observable<{ message: string }> {
    return this._http
      .post<{ message: string }>(`${this._API_URL}/resend-verification`, {
        email,
      })
      .pipe(
        catchError((error) => {
          console.error('Resend verification error:', error);
          return throwError(
            () =>
              new Error(
                error.error?.message ||
                  "Erreur lors de l'envoi du mail de vérification"
              )
          );
        })
      );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this._http
      .post<{ message: string }>(`${this._API_URL}/forgot-password`, {
        email,
      })
      .pipe(
        catchError((error) => {
          console.error('Forgot password error:', error);
          return throwError(
            () =>
              new Error(
                error.error?.message ||
                  'Erreur lors de la demande de réinitialisation'
              )
          );
        })
      );
  }

  resetPassword(
    token: string,
    password: string
  ): Observable<{ message: string }> {
    return this._http
      .post<{ message: string }>(`${this._API_URL}/reset-password`, {
        token,
        password,
      })
      .pipe(
        catchError((error) => {
          console.error('Reset password error:', error);
          return throwError(
            () =>
              new Error(
                error.error?.message ||
                  'Erreur lors de la réinitialisation du mot de passe'
              )
          );
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._currentUserSubject.next(null);
    this._router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!this._currentUserSubject.value;
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    // Vérifier si le token est expiré
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        this.logout();
        return null;
      }
      return token;
    } catch {
      this.logout();
      return null;
    }
  }
}
