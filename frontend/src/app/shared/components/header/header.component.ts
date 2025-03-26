import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false;
  isDropdownOpen = false;

  constructor(
    private _authService: AuthService,
    private _elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this._authService.currentUser$.subscribe((user) => {
      this.isAuthenticated = !!user;
    });
  }

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
