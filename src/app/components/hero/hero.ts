import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar';
import { HeroCardsComponent } from '../hero-cards/hero-cards';
import { StyleService, Sizes } from '../../services/style.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, NavbarComponent, HeroCardsComponent],
  templateUrl: './hero.html',
  styleUrls: ['./hero.css']
})
export class HeroComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isAdmin = false;
  colors: string[] = ['#000000', '#FFFFFF', '#F596D3', '#D247BF', '#61DAFB']; // Colores por defecto
  fonts: string[] = [
    'http://localhost:3000/public/fonts/Altone-Trial-Oblique.ttf',
    'http://localhost:3000/public/fonts/Neka-Laurent.ttf'
  ]; // Fuentes por defecto
  sizes: Sizes = { title: 48, subtitle: 32, paragraph: 18 };

  private subscriptions: Subscription[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private styleService: StyleService
  ) {
    console.log('HeroComponent constructor');
  }

  ngOnInit() {
    console.log('HeroComponent ngOnInit');
    this.checkAuthStatus();
    this.fetchDefaultColors();
    this.fetchDefaultFonts();
    this.subscribeToStyles();
  }

  ngOnDestroy() {
    console.log('HeroComponent ngOnDestroy');
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private fetchDefaultColors() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get('http://localhost:3000/colors/predeterminado', { headers })
      .subscribe({
        next: (res: any) => {
          console.log('Colores predeterminados recibidos:', res);
          if (res) {
            this.colors = [
              res.color_1,
              res.color_2,
              res.color_3,
              res.color_4,
              res.color_5
            ];
            console.log('Colores actualizados:', this.colors);
          }
        },
        error: (error) => {
          console.error('Error al obtener los colores predeterminados:', error);
        }
      });
  }

  private fetchDefaultFonts() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get('http://localhost:3000/fonts/predeterminado', { headers })
      .subscribe({
        next: (res: any) => {
          console.log('Fuentes predeterminadas recibidas:', res);
          if (res) {
            this.fonts = [
              `http://localhost:3000/public/fonts/${res.fuente_1}`,
              `http://localhost:3000/public/fonts/${res.fuente_2}`
            ];
            this.sizes = {
              paragraph: res.tamano_1,
              subtitle: res.tamano_2,
              title: res.tamano_3
            };
            console.log('Fuentes y tamaños actualizados:', this.fonts, this.sizes);
            this.loadCustomFonts();
          }
        },
        error: (error) => {
          console.error('Error al obtener las fuentes predeterminadas:', error);
        }
      });
  }

  private loadCustomFonts() {
    if (this.fonts[0]) {
      const font1 = new FontFace('CustomFont1', `url(${this.fonts[0]})`);
      font1.load().then((loaded) => {
        document.fonts.add(loaded);
      });
    }
    if (this.fonts[1]) {
      const font2 = new FontFace('CustomFont2', `url(${this.fonts[1]})`);
      font2.load().then((loaded) => {
        document.fonts.add(loaded);
      });
    }
  }

  private subscribeToStyles() {
    console.log('HeroComponent: Suscribiéndose a estilos...');
    
    // Suscribirse a los colores
    this.subscriptions.push(
      this.styleService.getColors().subscribe(colors => {
        console.log('HeroComponent: Colores recibidos:', colors);
        this.colors = colors;
      })
    );

    // Suscribirse a las fuentes
    this.subscriptions.push(
      this.styleService.getFonts().subscribe(fonts => {
        console.log('HeroComponent: Fuentes recibidas:', fonts);
        this.fonts = fonts;
        this.loadCustomFonts();
      })
    );

    // Suscribirse a los tamaños
    this.subscriptions.push(
      this.styleService.getSizes().subscribe(sizes => {
        console.log('HeroComponent: Tamaños recibidos:', sizes);
        this.sizes = sizes;
      })
    );
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

  goToColors() {
    this.router.navigate(['/colors']);
  }

  goToFonts() {
    this.router.navigate(['/fonts']);
  }
}
