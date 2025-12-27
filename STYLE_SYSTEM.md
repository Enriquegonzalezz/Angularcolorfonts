# Sistema de Estilos Dinámicos - ColorFonts Angular

## Descripción General

Este sistema permite aplicar colores, fuentes y tamaños dinámicos a todos los componentes de Angular, similar a como se implementó en React. Los estilos se obtienen desde el backend y se aplican automáticamente a toda la aplicación.

## Arquitectura

### StyleService (`src/app/services/style.service.ts`)

El servicio central que maneja:
- **Colores**: Array de 5 colores hexadecimales
- **Fuentes**: URLs de fuentes personalizadas
- **Tamaños**: Objeto con tamaños para título, subtítulo y párrafo

### Interfaces

```typescript
interface ColorData {
  color_1: string;
  color_2: string;
  color_3: string;
  color_4: string;
  color_5: string;
}

interface FontData {
  fuente_1: string;
  fuente_2: string;
  tamano_1: number;
  tamano_2: number;
  tamano_3: number;
}

interface Sizes {
  title: number;
  subtitle: number;
  paragraph: number;
}
```

## Cómo Usar

### 1. Inyectar el Service en un Componente

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StyleService, Sizes } from '../../services/style.service';

export class MiComponente implements OnInit, OnDestroy {
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
```

### 2. Aplicar Estilos en el Template

```html
<!-- Colores -->
<div [style.background]="colors[1]" [style.color]="colors[0]">
  Contenido
</div>

<!-- Fuentes -->
<h1 [style.font-family]="fonts[0] ? 'CustomFont1, sans-serif' : 'inherit'"
    [style.font-size.px]="sizes.title">
  Título
</h1>

<p [style.font-family]="fonts[1] ? 'CustomFont2, sans-serif' : 'inherit'"
   [style.font-size.px]="sizes.paragraph">
  Párrafo
</p>

<!-- Botones -->
<button [style.background]="colors[2]"
        [style.color]="colors[1]"
        [style.border-color]="colors[0]"
        [style.font-family]="fonts[1] ? 'CustomFont2, sans-serif' : 'inherit'"
        [style.font-size.px]="sizes.paragraph">
  Botón
</button>
```

## Paleta de Colores

- `colors[0]`: Color principal de texto
- `colors[1]`: Color de fondo secundario
- `colors[2]`: Color de acento (botones, enlaces)
- `colors[3]`: Color de fondo de tarjetas
- `colors[4]`: Color de sombras y efectos

## Fuentes

- `fonts[0]`: Primera fuente personalizada (CustomFont1)
- `fonts[1]`: Segunda fuente personalizada (CustomFont2)

## Tamaños

- `sizes.title`: Tamaño para títulos principales (48px por defecto)
- `sizes.subtitle`: Tamaño para subtítulos (32px por defecto)
- `sizes.paragraph`: Tamaño para párrafos (18px por defecto)

## Endpoints del Backend

El sistema hace peticiones a:
- `GET /colors/predeterminado` - Para obtener la paleta de colores
- `GET /fonts/predeterminado` - Para obtener fuentes y tamaños

## Componentes Actualizados

Los siguientes componentes ya están configurados para usar el sistema:

- ✅ HeroComponent
- ✅ NavbarComponent
- ✅ HeroCardsComponent
- ✅ FeaturesComponent
- ✅ FooterComponent
- ✅ HomeComponent
- ✅ CardCarouselComponent

## Carga de Fuentes

El sistema carga automáticamente las fuentes personalizadas usando la API FontFace:

```typescript
private loadFonts(fonts: string[]) {
  if (fonts[0]) {
    const font1 = new FontFace('CustomFont1', `url(${fonts[0]})`);
    font1.load().then((loaded) => {
      document.fonts.add(loaded);
    });
  }
  if (fonts[1]) {
    const font2 = new FontFace('CustomFont2', `url(${fonts[1]})`);
    font2.load().then((loaded) => {
      document.fonts.add(loaded);
    });
  }
}
```

## Valores por Defecto

Si no hay conexión al backend, se usan estos valores por defecto:

```typescript
private defaultColors = ['#000000', '#FFFFFF', '#F596D3', '#D247BF', '#61DAFB'];
private defaultFonts = [
  'http://localhost:3000/public/fonts/Altone-Trial-Oblique.ttf',
  'http://localhost:3000/public/fonts/Neka-Laurent.ttf'
];
private defaultSizes: Sizes = {
  title: 48,
  subtitle: 32,
  paragraph: 18,
};
```

## Notas Importantes

1. **Gestión de Memoria**: Siempre implementar `OnDestroy` y desuscribirse de los observables
2. **Fallbacks**: El sistema incluye fallbacks para cuando las fuentes no están disponibles
3. **Responsive**: Los tamaños se aplican en píxeles, considera usar unidades relativas para mejor responsive
4. **Performance**: Los estilos se aplican reactivamente, cualquier cambio en el backend se refleja automáticamente 