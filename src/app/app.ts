import { Component } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from './components/loading/loading.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, LoadingComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'shadcn-angular-landing';
  loading = true;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loading = true;
        console.log('Loading ON (NavigationStart)');
      }
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => {
          this.loading = false;
          console.log('Loading OFF (NavigationEnd/Cancel/Error)');
        }, 14498); // 400 ms de loading mínimo
      }
    });
  }

  ngOnInit() {
    // Para mostrar el loading al cargar la app por primera vez
    setTimeout(() => {
      this.loading = false;
      console.log('Loading OFF (ngOnInit)');
    }, 14498); // Puedes ajustar el tiempo según tu necesidad
  }
}
