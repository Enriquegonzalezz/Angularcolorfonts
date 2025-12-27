import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  isAdmin(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.admin === 1;
    } catch (error) {
      console.error('Error al verificar rol de administrador:', error);
      return false;
    }
  }

  getUserId(): number | null {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (error) {
      console.error('Error al obtener ID del usuario:', error);
      return null;
    }
  }

  getUserEmail(): string | null {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email;
    } catch (error) {
      console.error('Error al obtener email del usuario:', error);
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('access_token');
  }
} 