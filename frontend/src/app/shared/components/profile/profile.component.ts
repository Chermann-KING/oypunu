import { Component, ElementRef, HostListener } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  isDropdownOpen = false;

  constructor(
    private _authService: AuthService,
    private _elementRef: ElementRef
  ) {}

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout(): void {
    this._authService.logout();
    this.isDropdownOpen = false;
  }

  // Détecter un clic en dehors de la dropdown pour la fermer
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this._elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }
}
