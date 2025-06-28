import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { StyleService, Sizes } from '../../services/style.service';

interface RouteProps {
  href: string;
  label: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isOpen = false;
  isLoggedIn = false;
  colors: string[] = [];
  fonts: string[] = [];
  sizes: Sizes = { title: 48, subtitle: 32, paragraph: 18 };

  private subscriptions: Subscription[] = [];

  routeList: RouteProps[] = [
    {
      href: "#features",
      label: "Features",
    },
    {
      href: "#testimonials",
      label: "Testimonials",
    },
    {
      href: "#pricing",
      label: "Pricing",
    },
    {
      href: "#faq",
      label: "FAQ",
    },
  ];

  constructor(
    private router: Router,
    private styleService: StyleService
  ) {}

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem("access_token");
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

  handleLogout() {
    localStorage.removeItem("access_token");
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  closeMenu() {
    this.isOpen = false;
  }
}
