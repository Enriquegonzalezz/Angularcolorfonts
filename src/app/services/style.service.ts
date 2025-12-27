import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FontData {
  fuente_1: string;
  fuente_2: string;
  tamano_1: number;
  tamano_2: number;
  tamano_3: number;
}

export interface ColorData {
  color_1: string;
  color_2: string;
  color_3: string;
  color_4: string;
  color_5: string;
}

export interface Sizes {
  title: number;
  subtitle: number;
  paragraph: number;
}

@Injectable({
  providedIn: 'root'
})
export class StyleService {
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

  private colorsSubject = new BehaviorSubject<string[]>(this.defaultColors);
  private fontsSubject = new BehaviorSubject<string[]>(this.defaultFonts);
  private sizesSubject = new BehaviorSubject<Sizes>(this.defaultSizes);

  public colors$ = this.colorsSubject.asObservable();
  public fonts$ = this.fontsSubject.asObservable();
  public sizes$ = this.sizesSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('StyleService inicializado');
    this.testBackendConnection();
    this.loadDefaultStyles();
  }

  private testBackendConnection() {
    console.log('Probando conexión con el backend...');
    
    // Probar conexión básica
    this.http.get('http://localhost:3000/health', { responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log('✅ Backend conectado:', response);
        },
        error: (error) => {
          console.log('❌ Error conectando al backend:', error);
          console.log('Intentando conectar sin endpoint específico...');
          
          // Intentar con un endpoint que sabemos que existe
          this.http.get('http://localhost:3000/colors/predeterminado')
            .subscribe({
              next: (data) => {
                console.log('✅ Endpoint de colores accesible:', data);
              },
              error: (err) => {
                console.log('❌ Endpoint de colores no accesible:', err);
              }
            });
        }
      });
  }

  private loadDefaultStyles() {
    console.log('Cargando estilos por defecto...');
    this.fetchDefaultColors();
    this.fetchDefaultFonts();
  }

  private fetchDefaultColors() {
    console.log('Intentando obtener colores del backend...');
    
    // Intentar con token si existe
    const token = localStorage.getItem('access_token');
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      console.log('Usando token para obtener colores');
    } else {
      console.log('No hay token, intentando sin autenticación');
    }

    this.http.get<ColorData>('http://localhost:3000/colors/predeterminado', { headers })
      .subscribe({
        next: (data) => {
          console.log('Colores obtenidos del backend:', data);
          if (data) {
            const colors = [
              data.color_1,
              data.color_2,
              data.color_3,
              data.color_4,
              data.color_5,
            ];
            console.log('Aplicando colores:', colors);
            this.colorsSubject.next(colors);
          }
        },
        error: (error) => {
          console.error('Error al obtener los colores:', error);
          console.log('Usando colores por defecto');
        }
      });
  }

  private fetchDefaultFonts() {
    console.log('Intentando obtener fuentes del backend...');
    
    // Intentar con token si existe
    const token = localStorage.getItem('access_token');
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      console.log('Usando token para obtener fuentes');
    } else {
      console.log('No hay token, intentando sin autenticación');
    }

    this.http.get<FontData>('http://localhost:3000/fonts/predeterminado', { headers })
      .subscribe({
        next: (data) => {
          console.log('Fuentes obtenidas del backend:', data);
          if (data) {
            const fonts = [
              `http://localhost:3000/public/fonts/${data.fuente_1}`,
              `http://localhost:3000/public/fonts/${data.fuente_2}`,
            ];
            console.log('Aplicando fuentes:', fonts);
            this.fontsSubject.next(fonts);
            
            const sizes: Sizes = {
              paragraph: data.tamano_1,
              subtitle: data.tamano_2,
              title: data.tamano_3,
            };
            console.log('Aplicando tamaños:', sizes);
            this.sizesSubject.next(sizes);
            
            this.loadFonts(fonts);
          }
        },
        error: (error) => {
          console.error('Error al obtener las fuentes y tamaños:', error);
          console.log('Usando fuentes y tamaños por defecto');
          // Cargar fuentes por defecto
          this.loadFonts(this.defaultFonts);
        }
      });
  }

  private loadFonts(fonts: string[]) {
    console.log('Cargando fuentes:', fonts);
    if (fonts[0]) {
      const font1 = new FontFace('CustomFont1', `url(${fonts[0]})`);
      font1.load().then((loaded) => {
        document.fonts.add(loaded);
        console.log('Fuente CustomFont1 cargada');
      }).catch(error => {
        console.error('Error cargando CustomFont1:', error);
      });
    }
    if (fonts[1]) {
      const font2 = new FontFace('CustomFont2', `url(${fonts[1]})`);
      font2.load().then((loaded) => {
        document.fonts.add(loaded);
        console.log('Fuente CustomFont2 cargada');
      }).catch(error => {
        console.error('Error cargando CustomFont2:', error);
      });
    }
  }

  getColors(): Observable<string[]> {
    return this.colors$;
  }

  getFonts(): Observable<string[]> {
    return this.fonts$;
  }

  getSizes(): Observable<Sizes> {
    return this.sizes$;
  }

  getCurrentColors(): string[] {
    return this.colorsSubject.value;
  }

  getCurrentFonts(): string[] {
    return this.fontsSubject.value;
  }

  getCurrentSizes(): Sizes {
    return this.sizesSubject.value;
  }
} 