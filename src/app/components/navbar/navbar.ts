import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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
export class NavbarComponent implements OnInit {
  isOpen = false;
  isLoggedIn = false;

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

  constructor(private router: Router) {}

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem("access_token");
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
