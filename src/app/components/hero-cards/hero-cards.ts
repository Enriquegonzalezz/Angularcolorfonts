import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { StyleService, Sizes } from '../../services/style.service';

@Component({
  selector: 'app-hero-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-cards.html',
  styleUrls: ['./hero-cards.css']
})
export class HeroCardsComponent implements OnInit, OnDestroy {
  colors: string[] = [];
  fonts: string[] = [];
  sizes: Sizes = { title: 48, subtitle: 32, paragraph: 18 };

  private subscriptions: Subscription[] = [];

  constructor(private styleService: StyleService) {}

  ngOnInit() {
    this.subscribeToStyles();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToStyles() {
    // Suscribirse a los colores
    this.subscriptions.push(
      this.styleService.getColors().subscribe(colors => {
        this.colors = colors;
      })
    );

    // Suscribirse a las fuentes
    this.subscriptions.push(
      this.styleService.getFonts().subscribe(fonts => {
        this.fonts = fonts;
      })
    );

    // Suscribirse a los tamaños
    this.subscriptions.push(
      this.styleService.getSizes().subscribe(sizes => {
        this.sizes = sizes;
      })
    );
  }
}
