import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
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

  constructor(private _http: HttpClient) {
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
        })
      );
  }

  register(
    username: string,
    email: string,
    password: string
  ): Observable<AuthResponse> {
    return this._http
      .post<AuthResponse>(`${this._API_URL}/register`, {
        username,
        email,
        password,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.tokens.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this._currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this._currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
