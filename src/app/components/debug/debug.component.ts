import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { StyleService, Sizes } from '../../services/style.service';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="debug-panel" 
         [style.background]="colors[1]" 
         [style.color]="colors[0]"
         [style.padding]="'20px'"
         [style.margin]="'20px'"
         [style.border]="'2px solid ' + colors[2]">
      
      <h2 [style.font-family]="fonts[0] ? 'CustomFont1, sans-serif' : 'inherit'"
          [style.font-size.px]="sizes.title"
          [style.color]="colors[2]">
        Debug Panel - Estilos Dinámicos
      </h2>
      
      <div [style.font-family]="fonts[1] ? 'CustomFont2, sans-serif' : 'inherit'"
           [style.font-size.px]="sizes.paragraph">
        
        <h3 [style.font-size.px]="sizes.subtitle">Colores:</h3>
        <ul>
          <li *ngFor="let color of colors; let i = index">
            Color {{ i }}: {{ color }}
            <div [style.background]="color" 
                 [style.width]="'50px'" 
                 [style.height]="'20px'" 
                 [style.display]="'inline-block'"
                 [style.margin-left]="'10px'"></div>
          </li>
        </ul>
        
        <h3 [style.font-size.px]="sizes.subtitle">Fuentes:</h3>
        <ul>
          <li *ngFor="let font of fonts; let i = index">
            Fuente {{ i }}: {{ font }}
          </li>
        </ul>
        
        <h3 [style.font-size.px]="sizes.subtitle">Tamaños:</h3>
        <ul>
          <li>Título: {{ sizes.title }}px</li>
          <li>Subtítulo: {{ sizes.subtitle }}px</li>
          <li>Párrafo: {{ sizes.paragraph }}px</li>
        </ul>
        
        <button [style.background]="colors[2]"
                [style.color]="colors[1]"
                [style.border-color]="colors[0]"
                [style.padding]="'10px 20px'"
                [style.margin]="'10px'"
                [style.font-family]="fonts[1] ? 'CustomFont2, sans-serif' : 'inherit'"
                [style.font-size.px]="sizes.paragraph">
          Botón de Prueba
        </button>
      </div>
    </div>
  `,
  styles: [`
    .debug-panel {
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    ul {
      list-style: none;
      padding-left: 0;
    }
    
    li {
      margin: 5px 0;
    }
  `]
})
export class DebugComponent implements OnInit, OnDestroy {
  colors: string[] = [];
  fonts: string[] = [];
  sizes: Sizes = { title: 48, subtitle: 32, paragraph: 18 };

  private subscriptions: Subscription[] = [];

  constructor(private styleService: StyleService) {
    console.log('DebugComponent constructor');
  }

  ngOnInit() {
    console.log('DebugComponent ngOnInit');
    this.subscribeToStyles();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToStyles() {
    console.log('DebugComponent: Suscribiéndose a estilos...');
    
    // Suscribirse a los colores
    this.subscriptions.push(
      this.styleService.getColors().subscribe(colors => {
        console.log('DebugComponent: Colores recibidos:', colors);
        this.colors = colors;
      })
    );

    // Suscribirse a las fuentes
    this.subscriptions.push(
      this.styleService.getFonts().subscribe(fonts => {
        console.log('DebugComponent: Fuentes recibidas:', fonts);
        this.fonts = fonts;
      })
    );

    // Suscribirse a los tamaños
    this.subscriptions.push(
      this.styleService.getSizes().subscribe(sizes => {
        console.log('DebugComponent: Tamaños recibidos:', sizes);
        this.sizes = sizes;
      })
    );
  }
} 