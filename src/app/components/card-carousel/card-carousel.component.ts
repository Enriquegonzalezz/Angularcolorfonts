import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { StyleService, Sizes } from '../../services/style.service';

export interface Card {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
}

@Component({
  selector: 'app-card-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-carousel.component.html',
  styleUrls: ['./card-carousel.component.css']
})
export class CardCarouselComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('cardsContainer') cardsContainer!: ElementRef<HTMLDivElement>;
  
  colors: string[] = [];
  fonts: string[] = [];
  sizes: Sizes = { title: 48, subtitle: 32, paragraph: 18 };

  private subscriptions: Subscription[] = [];
  
  cards: Card[] = [
    {
      id: 1,
      title: 'Diseño Web',
      description: 'Creamos sitios web modernos y responsivos que se adaptan a cualquier dispositivo.',
      imageUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      buttonText: 'Ver más'
    },
    {
      id: 2,
      title: 'Desarrollo Móvil',
      description: 'Aplicaciones móviles nativas e híbridas para iOS y Android.',
      imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      buttonText: 'Ver más'
    },
    {
      id: 3,
      title: 'SEO',
      description: 'Mejoramos tu visibilidad en los motores de búsqueda.',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      buttonText: 'Ver más'
    },
    {
      id: 4,
      title: 'Marketing Digital',
      description: 'Estrategias de marketing digital para llegar a más clientes.',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      buttonText: 'Ver más'
    },
    {
      id: 5,
      title: 'Branding',
      description: 'Desarrollo de identidad de marca que destaque tu negocio.',
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      buttonText: 'Ver más'
    }
  ];

  currentIndex = 0;
  cardWidth = 300; // Ancho fijo de cada tarjeta
  gap = 20; // Espacio entre tarjetas
  visibleCards = 3; // Número de tarjetas visibles en el carrusel

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

  ngAfterViewInit() {
    this.updateCarousel();
    // Actualizar el número de tarjetas visibles según el ancho de la pantalla
    this.updateVisibleCards();
    window.addEventListener('resize', this.updateVisibleCards.bind(this));
  }

  updateVisibleCards() {
    const width = window.innerWidth;
    if (width < 768) {
      this.visibleCards = 1;
    } else if (width < 1024) {
      this.visibleCards = 2;
    } else {
      this.visibleCards = 3;
    }
    this.updateCarousel();
  }

  scrollToIndex(index: number) {
    this.currentIndex = index;
    this.updateCarousel();
  }

  scroll(direction: 'prev' | 'next') {
    const maxIndex = this.cards.length - this.visibleCards;
    
    if (direction === 'prev' && this.currentIndex > 0) {
      this.currentIndex--;
    } else if (direction === 'next' && this.currentIndex < maxIndex) {
      this.currentIndex++;
    }
    
    this.updateCarousel();
  }

  updateCarousel() {
    if (this.cardsContainer) {
      const scrollPosition = this.currentIndex * (this.cardWidth + this.gap);
      this.cardsContainer.nativeElement.style.transform = `translateX(-${scrollPosition}px)`;
    }
  }

  trackByFn(index: number, item: Card): number {
    return item.id;
  }
}
