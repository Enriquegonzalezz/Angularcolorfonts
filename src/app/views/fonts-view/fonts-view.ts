import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';

interface FontRow {
  id: number;
  fuente_1: string;
  fuente_2: string;
  tamano_1: number;
  tamano_2: number;
  tamano_3: number;
  is_default: boolean;
}

@Component({
  selector: 'app-fonts-view',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
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

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchFonts();
  }

  ngOnDestroy() {
    this.removeDynamicStyles();
  }

  private removeDynamicStyles() {
    if (this.styleElement1) {
      document.head.removeChild(this.styleElement1);
      this.styleElement1 = null;
    }
    if (this.styleElement2) {
      document.head.removeChild(this.styleElement2);
      this.styleElement2 = null;
    }
  }

  private addDynamicStyle(fontUrl: string, fontFamily: string) {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @font-face {
        font-family: '${fontFamily}';
        src: url('${fontUrl}');
      }
    `;
    document.head.appendChild(styleElement);
    return styleElement;
  }

  fetchFonts() {
    // const token = localStorage.getItem('access_token');
    // if (!token) {
    //   this.router.navigate(['/login']);
    //   return;
    // }

    // const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<FontRow[]>('http://localhost:3000/fonts')
      .subscribe({
        next: (data) => {
          this.savedFonts = Array.isArray(data) ? data : [data];
          // Find the default font set
          const defaultFont = data.find(font => font.is_default);
          if (defaultFont) {
            this.defaultFontId = defaultFont.id;
          }
        },
        error: (error) => {
          console.error('Error al obtener las fuentes:', error);
          // this.router.navigate(['/login']);
        }
      });
  }

  handleFileChange(index: number, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] || null;
    const newFiles = [...this.fontFiles];
    const newUrls = [...this.fontUrls];

    newFiles[index] = file;
    if (file) {
      newUrls[index] = URL.createObjectURL(file);
    } else {
      newUrls[index] = null;
    }

    this.fontFiles = newFiles;
    this.fontUrls = newUrls;
    this.updateDynamicStyles();
  }

  private updateDynamicStyles() {
    this.removeDynamicStyles();

    if (this.previewFontUrl1) {
      this.styleElement1 = this.addDynamicStyle(this.previewFontUrl1, 'Font1');
    }

    if (this.previewFontUrl2) {
      this.styleElement2 = this.addDynamicStyle(this.previewFontUrl2, 'Font2');
    }
  }

  handleSizeChange(key: keyof typeof this.sizes, value: number) {
    this.sizes = { ...this.sizes, [key]: value };
  }

  handleSave() {
    // const token = localStorage.getItem('access_token');
    // if (!token) {
    //   this.router.navigate(['/login']);
    //   return;
    // }

    const formData = new FormData();
    if (this.fontFiles[0]) formData.append('fuente_1', this.fontFiles[0]);
    if (this.fontFiles[1]) formData.append('fuente_2', this.fontFiles[1]);
    formData.append('tamano_1', this.sizes.paragraph.toString());
    formData.append('tamano_2', this.sizes.subtitle.toString());
    formData.append('tamano_3', this.sizes.title.toString());
    formData.append('is_default', this.defaultFontId === null ? 'true' : 'false');

    // const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('http://localhost:3000/fonts/store', formData)
      .subscribe({
        next: () => {
          this.fetchFonts();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error al guardar las fuentes:', error);
          // this.router.navigate(['/login']);
        }
      });
  }

  handleDelete(fontId: number) {
    // const token = localStorage.getItem('access_token');
    // if (!token) {
    //   this.router.navigate(['/login']);
    //   return;
    // }

    // If deleting default font, clear defaultFontId
    if (this.defaultFontId === fontId) {
      this.defaultFontId = null;
    }

    // const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://localhost:3000/fonts/delete/${fontId}`)
      .subscribe({
        next: () => {
          this.savedFonts = this.savedFonts.filter(row => row.id !== fontId);
        },
        error: (error) => {
          console.error('Error al eliminar la fuente:', error);
          // this.router.navigate(['/login']);
        }
      });
  }

  handleEdit(rowIdx: number) {
    this.editRow = rowIdx;
    const row = this.savedFonts[rowIdx];
    this.sizes = {
      paragraph: row.tamano_1,
      subtitle: row.tamano_2,
      title: row.tamano_3,
    };
    this.fontFiles = [null, null];
    this.fontUrls = [row.fuente_1, row.fuente_2];

    if (row.is_default) {
      this.defaultFontId = row.id;
    }

    this.updateDynamicStyles();
  }

  handleUpdate() {
    if (this.editRow === null) return;

    // const token = localStorage.getItem('access_token');
    // if (!token) {
    //   this.router.navigate(['/login']);
    //   return;
    // }

    // const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const fontId = this.savedFonts[this.editRow].id;
    const fontData = {
      tamano_1: this.sizes.paragraph,
      tamano_2: this.sizes.subtitle,
      tamano_3: this.sizes.title,
      is_default: this.defaultFontId === fontId
    };

    this.http.put(`http://localhost:3000/fonts/update/${fontId}`, fontData)
      .subscribe({
        next: () => {
          this.fetchFonts();
          this.editRow = null;
          this.resetForm();
        },
        error: (error) => {
          console.error('Error al actualizar las fuentes:', error);
        }
      });
  }

  resetForm() {
    this.fontFiles = [null, null];
    this.fontUrls = [null, null];
    this.sizes = { paragraph: 16, subtitle: 24, title: 32 };
    this.removeDynamicStyles();
  }

  get previewFontUrl1(): string | null {
    if (this.fontUrls[0] && this.fontFiles[0]) {
      return this.fontUrls[0];
    }
    if (this.editRow !== null && this.savedFonts[this.editRow]?.fuente_1) {
      return `${this.FONT_BASE_URL}${this.savedFonts[this.editRow].fuente_1}`;
    }
    return null;
  }

  get previewFontUrl2(): string | null {
    if (this.fontUrls[1] && this.fontFiles[1]) {
      return this.fontUrls[1];
    }
    if (this.editRow !== null && this.savedFonts[this.editRow]?.fuente_2) {
      return `${this.FONT_BASE_URL}${this.savedFonts[this.editRow].fuente_2}`;
    }
    return null;
  }

  get fontFamily1(): string {
    return this.previewFontUrl1 ? "'Font1', sans-serif" : "sans-serif";
  }

  get fontFamily2(): string {
    return this.previewFontUrl2 ? "'Font2', serif" : "serif";
  }

  handleSetDefault(fontId: number) {
    // const token = localStorage.getItem('access_token');
    // if (!token) {
    //   this.router.navigate(['/login']);
    //   return;
    // }

    if (this.defaultFontId === fontId) {
      this.defaultFontId = null;
    } else {
      this.defaultFontId = fontId;
    }

    const font = this.savedFonts.find(f => f.id === fontId);
    if (font) {
      // Update all fonts to set/unset default
      this.savedFonts.forEach(f => {
        f.is_default = f.id === fontId;
      });

      // Save changes to the server
      // const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.put(`http://localhost:3000/fonts/update/${fontId}`, {
        is_default: true
      }).subscribe({
        next: () => {
          console.log('Default font updated successfully');
        },
        error: (error) => {
          console.error('Error updating default font:', error);
          // this.router.navigate(['/login']);
        }
      });
    }
  }
}
