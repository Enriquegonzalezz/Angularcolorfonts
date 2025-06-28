import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavbarComponent } from '../navbar/navbar';
import { HeroCardsComponent } from '../hero-cards/hero-cards';

interface ColorData {
  color_1: string;
  color_2: string;
  color_3: string;
  color_4: string;
  color_5: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, HeroCardsComponent],
  templateUrl: './hero.html',
  styleUrls: ['./hero.css']
})
export class HeroComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  colors: string[] = ['#000000', '#FFFFFF', '#F596D3', '#D247BF', '#61DAFB'];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkAuthStatus();
    this.fetchDefaultColors();
  }

  checkAuthStatus() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.isLoggedIn = false;
      this.isAdmin = false;
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get('http://localhost:3000/auth', { headers })
      .subscribe({
        next: (res: any) => {
          this.isLoggedIn = true;
          this.isAdmin = res.admin === 1;
        },
        error: () => {
          this.isLoggedIn = false;
          this.isAdmin = false;
        }
      });
  }

  fetchDefaultColors() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<ColorData>('http://localhost:3000/colors/predeterminado', { headers })
      .subscribe({
        next: (data) => {
          if (data) {
            this.colors = [
              data.color_1,
              data.color_2,
              data.color_3,
              data.color_4,
              data.color_5,
            ];
          }
        },
        error: (error) => {
          console.error('Error al obtener los colores:', error);
        }
      });
  }

  goToColors() {
    this.router.navigate(['/colors']);
  }

  goToFonts() {
    this.router.navigate(['/fonts']);
  }
}
