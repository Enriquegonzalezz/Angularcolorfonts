import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup-view.html',
  styleUrl: './signup-view.css'
})
export class SignupViewComponent {
  formData = {
    username: '',
    email: '',
    password: '',
  };
  isLoading = false;
  error = '';

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
    this.error = '';

    try {
      await this.http.post('http://localhost:3000/register', {
        username: this.formData.username,
        email: this.formData.email,
        password: this.formData.password,
      }).toPromise();

      this.router.navigate(['/login']);
    } catch (err) {
      this.error = 'Ya existe una cuenta con ese email.';
    } finally {
      this.isLoading = false;
    }
  }
}
