import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar';
import { HeroComponent } from '../../components/hero/hero';
import { FooterComponent } from '../../components/footer/footer';
import { FeaturesComponent } from '../../components/features/features';
import { CardCarouselComponent } from '../../components/card-carousel/card-carousel.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    HeroComponent, 
    FooterComponent, 
    FeaturesComponent,
    CardCarouselComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  // Home component logic here
}
