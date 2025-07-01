import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    try {
      // Decodificar el token para obtener información del usuario
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Verificar si el usuario es administrador
      if (payload.admin === 1) {
        return true;
      } else {
        // Si no es administrador, redirigir al home
        this.router.navigate(['/']);
        alert('Acceso denegado. Solo los administradores pueden acceder a esta página.');
        return false;
      }
    } catch (error) {
      console.error('Error al verificar token:', error);
      this.router.navigate(['/login']);
      return false;
    }
  }
} 