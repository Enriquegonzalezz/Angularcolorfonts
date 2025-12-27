import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="bg-background border-b">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <a [routerLink]="['/']" class="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-primary">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
              <path d="m3.3 7 8.7 5 8.7-5"></path>
              <path d="M12 22V12"></path>
            </svg>
            <span class="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {{ appName || 'Style Guide' }}
            </span>
          </a>
          
          <!-- Navigation -->
          <nav class="hidden md:flex items-center space-x-6">
            <a [routerLink]="['/']" class="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Inicio
            </a>
            <a [routerLink]="['/colors']" class="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Colores
            </a>
            <a [routerLink]="['/fonts']" class="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Fuentes
            </a>
          </nav>
          
          <!-- Mobile menu button -->
          <button type="button" class="md:hidden text-foreground/70 hover:text-foreground" (click)="toggleMobileMenu()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
              <line x1="4" x2="20" y1="12" y2="12"></line>
              <line x1="4" x2="20" y1="6" y2="6"></line>
              <line x1="4" x2="20" y1="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <!-- Mobile menu -->
        <div *ngIf="isMobileMenuOpen" class="md:hidden mt-4 space-y-2 pb-2">
          <a [routerLink]="['/']" class="block px-3 py-2 rounded-md text-base font-medium text-foreground/70 hover:bg-accent hover:text-foreground">
            Inicio
          </a>
          <a [routerLink]="['/colors']" class="block px-3 py-2 rounded-md text-base font-medium text-foreground/70 hover:bg-accent hover:text-foreground">
            Colores
          </a>
          <a [routerLink]="['/fonts']" class="block px-3 py-2 rounded-md text-base font-medium text-foreground/70 hover:bg-accent hover:text-foreground">
            Fuentes
          </a>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class HeaderComponent {
  @Input() appName?: string;
  isMobileMenuOpen = false;

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
