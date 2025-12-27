import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login-view.html',
  styleUrl: './login-view.css'
})
export class LoginViewComponent {
  formData = { email: '', password: '' };
  isLoading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  handleChange(event: any) {
    const { name, value } = event.target;
    this.formData = {
      ...this.formData,
      [name]: value,
    };
  }

  async handleSubmit(event: Event) {
    event.preventDefault();
    this.isLoading = true;
    this.error = null;

    try {
      console.log('🔐 Intentando login con:', this.formData.email);
      
      const response: any = await this.http.post('http://localhost:3000/login', {
        email: this.formData.email,
        password: this.formData.password,
      }).toPromise();

      console.log('✅ Login exitoso:', response);
      
      if (response.token) {
        localStorage.setItem('access_token', response.token);
        console.log('💾 Token guardado en localStorage como "access_token"');
        this.router.navigate(['/']);
        this.isLoading = false;
        alert('Login exitoso: ' + response.message);
      } else {
        throw new Error('No se recibió token en la respuesta');
      }
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      this.isLoading = false;
      
      if (err.status === 400) {
        this.error = 'Ocurrió un error inesperado. Inténtalo de nuevo.';
      } else if (err.status === 401) {
        this.error = 'Usuario o contraseña incorrectos, vuelva a intentarlo.';
      } else if (err.status === 403) {
        this.error = 'Tu cuenta ha sido inhabilitada. Contacta al administrador.';
      } else if (err.status === 0) {
        this.error = 'Error de conexión. Verifica que el servidor esté ejecutándose.';
      } else {
        // Verificar si es un error de usuario inhabilitado
        const errorMessage = err.error?.error || err.message || 'Error desconocido';
        if (errorMessage.includes('inhabilitada')) {
          this.error = 'Tu cuenta ha sido inhabilitada. Contacta al administrador.';
        } else {
          this.error = 'Error inesperado: ' + errorMessage;
        }
      }
    }
  }
}
