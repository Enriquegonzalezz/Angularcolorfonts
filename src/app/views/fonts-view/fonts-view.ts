import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';

interface FontRow {
  id: number;
  fuente_1: string;
  fuente_2: string;
  tamano_1: number;
  tamano_2: number;
  tamano_3: number;
  is_default: boolean;
  predeterminado?: number; // Para compatibilidad con el backend
}

@Component({
  selector: 'app-fonts-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './fonts-view.html',
  styleUrl: './fonts-view.css'
})
export class FontsViewComponent implements OnInit, OnDestroy {
  fontFiles: (File | null)[] = [null, null];
  fontUrls: (string | null)[] = [null, null];
  sizes = { paragraph: 16, subtitle: 24, title: 32 };
  savedFonts: FontRow[] = [];
  editRow: number | null = null;
  defaultFontId: number | null = null;
  FONT_BASE_URL = 'http://localhost:3000/public/fonts/';
  private styleElement1: HTMLStyleElement | null = null;
  private styleElement2: HTMLStyleElement | null = null;

  // Hacer Math y Number disponibles en el template
  Math = Math;
  Number = Number;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchFonts();
  }

  ngOnDestroy() {
    if (this.styleElement1) {
      document.head.removeChild(this.styleElement1);
    }
    if (this.styleElement2) {
      document.head.removeChild(this.styleElement2);
    }
  }

  handleFileChange(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.fontFiles[index] = input.files[0];
      this.updateFontPreview(index);
    }
  }

  handleSizeChange(type: 'paragraph' | 'subtitle' | 'title', value: number) {
    this.sizes[type] = value;
  }

  handleSave() {
    // Implementar lógica de guardado
  }

  handleUpdate() {
    // Implementar lógica de actualización
  }

  handleDelete(id: number) {
    // Implementar lógica de eliminación
  }

  handleEdit(index: number) {
    // Implementar lógica de edición
  }

  handleToggleDefault(id: number) {
    // Implementar lógica para establecer como predeterminado
  }

  private fetchFonts() {
    // Implementar lógica para obtener fuentes guardadas
  }

  private updateFontPreview(index: number) {
    // Implementar lógica para actualizar la vista previa de la fuente
  }

  goToColors() {
    this.router.navigate(['/colors']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  get fontFamily1(): string {
    return this.previewFontUrl1 ? "'Font1', sans-serif" : "sans-serif";
  }

  get fontFamily2(): string {
    return this.previewFontUrl2 ? "'Font2', serif" : "serif";
  }

  get previewFontUrl1(): string | null {
    if (this.fontUrls && this.fontUrls[0]) {
      return this.fontUrls[0];
    }
    return null;
  }

  get previewFontUrl2(): string | null {
    if (this.fontUrls && this.fontUrls[1]) {
      return this.fontUrls[1];
    }
    return null;
  }
}
