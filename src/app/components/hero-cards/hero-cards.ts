import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-hero-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-cards.html',
  styleUrls: ['./hero-cards.css']
})
export class HeroCardsComponent implements OnInit {
  colors = ['#000000', '#FFFFFF', '#F596D3', '#D247BF', '#61DAFB'];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchColors();
  }

  private fetchColors() {
    const token = localStorage.getItem('access_token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.get('http://localhost:3000/colors/predeterminado', { headers })
        .subscribe({
          next: (data: any) => {
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
  }
}
