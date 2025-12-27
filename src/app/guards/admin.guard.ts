import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Verificar si el usuario está autenticado y es administrador
    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      return true;
    }
    
    // Si no es administrador, redirigir al login
    this.router.navigate(['/login']);
    return false;
  }
} 