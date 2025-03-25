import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private _authService: AuthService, private _router: Router) {}

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this._authService.isAuthenticated()) {
      return true;
    }
    console.log('AuthGuard: user is not authenticated');
    // Rediriger vers la page login si l'utilisateur n'est pas connecté
    return this._router.createUrlTree(['/auth/login']);
  }
}
