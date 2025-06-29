import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
      const response: any = await this.http.post('http://localhost:3000/login', {
        email: this.formData.email,
        password: this.formData.password,
      }).toPromise();

      localStorage.setItem('access_token', response.token);
      this.router.navigate(['/']);
      this.isLoading = false;
      alert('Login exitoso: ' + response.message);
    } catch (err: any) {
      if (err.response && err.response.status === 400) {
        this.error = 'Ocurrió un error inesperado. Inténtalo de nuevo.';
      } else {
        this.error = 'Usuario o contraseña incorrectos, vuelva a intentarlo.';
        this.isLoading = false;
        console.error(err);
      }
    }
  }
}
