import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar';
import { HeroCardsComponent } from '../hero-cards/hero-cards';
import { StyleService, Sizes } from '../../services/style.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, HeroCardsComponent],
  templateUrl: './hero.html',
  styleUrls: ['./hero.css']
})
export class HeroComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isAdmin = false;
  colors: string[] = [];
  fonts: string[] = [];
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
    this.subscribeToStyles();
  }

  ngOnDestroy() {
    console.log('HeroComponent ngOnDestroy');
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
