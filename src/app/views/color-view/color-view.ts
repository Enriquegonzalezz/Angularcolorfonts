import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';

interface ColorRow {
  id: number;
  color_1: string;
  color_2: string;
  color_3: string;
  color_4: string;
  color_5: string;
  is_default: boolean;
}

@Component({
  selector: 'app-color-view',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './color-view.html',
  styleUrl: './color-view.css'
})
export class ColorViewComponent implements OnInit {
  colors: string[] = ['#000000', '#FFFFFF', '#F596D3', '#D247BF', '#61DAFB'];
  savedColors: ColorRow[] = [];
  defaultColorId: number | null = null;
  editRow: number | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Ensure editRow is properly initialized as null
    this.editRow = null;
  }

  ngOnInit() {
    // Force editRow to be null at the start
    this.editRow = null;
    this.fetchColors();
    console.log('ColorView initialized - editRow:', this.editRow, 'isValid:', this.isValidColorPalette());
  }

  // Handle setting default color
  handleSetDefault(colorId: number) {
    // const token = localStorage.getItem('access_token');
    // if (!token) {
    //   this.router.navigate(['/login']);
    //   return;
    // }

    if (this.defaultColorId === colorId) {
      this.defaultColorId = null;
    } else {
      this.defaultColorId = colorId;
    }

    const color = this.savedColors.find(c => c.id === colorId);
    if (color) {
      // Update all colors to set/unset default
      this.savedColors.forEach(c => {
        c.is_default = c.id === colorId;
      });

      // Save changes to the server
      // const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.put(`http://localhost:3000/colors/update/${colorId}`, {
        is_default: true
      }).subscribe({
        next: () => {
          console.log('Default color updated successfully');
        },
        error: (error) => {
          console.error('Error updating default color:', error);
          // this.router.navigate(['/login']);
        }
      });
    }
  }

  fetchColors() {
    // const token = localStorage.getItem('access_token');
    // if (!token) {
    //   this.router.navigate(['/login']);
    //   return;
    // }

    // const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<ColorRow[]>('http://localhost:3000/colors')
      .subscribe({
        next: (data) => {
          this.savedColors = data;
          // Find the default color set
          const defaultColor = data.find(color => color.is_default);
          if (defaultColor) {
            this.defaultColorId = defaultColor.id;
          }
        },
        error: (error) => {
          console.error('Error al obtener los colores:', error);
          // this.router.navigate(['/login']);
        }
      });
  }

  handleColorChange(index: number, value: string) {
    this.colors[index] = value;
  }

  isValidColorPalette(): boolean {
    const isValid = this.colors.every(color => color.length === 7);
    console.log('Validating palette:', this.colors, 'isValid:', isValid);
    return isValid;
  }

  handleSave() {
    console.log('Botón de guardar presionado');
    console.log('Colores actuales:', this.colors);
    console.log('¿Es válida la paleta?', this.isValidColorPalette());
    
    // Verificar si hay colores vacíos o inválidos
    if (this.colors.some(color => !color || color.length !== 7)) {
      console.error('Hay colores vacíos o inválidos');
      alert('Por favor, asegúrate de que todos los colores estén seleccionados correctamente');
      return;
    }
    
    if (!this.isValidColorPalette()) {
      console.error('La paleta de colores no es válida');
      alert('La paleta de colores no es válida. Asegúrate de que todos los colores tengan un formato hexadecimal válido (ej: #RRGGBB)');
      return;
    }

    const colorData: ColorRow = {
      id: 0, // Este valor lo establecerá el servidor
      color_1: this.colors[0],
      color_2: this.colors[1],
      color_3: this.colors[2],
      color_4: this.colors[3],
      color_5: this.colors[4],
      is_default: this.defaultColorId === null
    };

    console.log('Enviando datos al servidor:', colorData);

    try {
      this.http.post('http://localhost:3000/colors/store', colorData)
        .subscribe({
          next: (response) => {
            console.log('Respuesta del servidor:', response);
            console.log('Datos guardados exitosamente');
            this.fetchColors();
            // Resetear el formulario después de guardar
            this.resetForm();
          },
          error: error => {
            console.error('Error al guardar los colores:', error);
            if (error.status === 0) {
              console.error('No se pudo conectar al servidor. ¿Está ejecutando el servidor backend en http://localhost:3000?');
            }
          }
        });
    } catch (error) {
      console.error('Error inesperado al intentar guardar:', error);
    }
  }

  handleDelete(colorId: number) {
    // const token = localStorage.getItem('access_token');
    // if (!token) {
    //   this.router.navigate(['/login']);
    //   return;
    // }

    // If deleting default color, clear defaultColorId
    if (this.defaultColorId === colorId) {
      this.defaultColorId = null;
    }

    // const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://localhost:3000/colors/delete/${colorId}`)
      .subscribe({
        next: () => this.savedColors = this.savedColors.filter(row => row.id !== colorId),
        error: error => {
          console.error('Error al eliminar el color:', error);
          // this.router.navigate(['/login']);
        }
      });
  }

  handleEdit(rowIdx: number) {
    this.editRow = rowIdx;
    const row = this.savedColors[rowIdx];
    this.colors = [row.color_1, row.color_2, row.color_3, row.color_4, row.color_5];

    // Set default color if this was the default one
    if (row.is_default) {
      this.defaultColorId = row.id;
    }
  }

  handleUpdate() {
    if (this.editRow === null) return;

    // const token = localStorage.getItem('access_token');
    // if (!token) {
    //   this.router.navigate(['/login']);
    //   return;
    // }

    const colorId = this.savedColors[this.editRow].id;
    const colorData: ColorRow = {
      id: colorId,
      color_1: this.colors[0],
      color_2: this.colors[1],
      color_3: this.colors[2],
      color_4: this.colors[3],
      color_5: this.colors[4],
      is_default: this.defaultColorId === colorId
    };

    // const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put(`http://localhost:3000/colors/update/${colorId}`, colorData)
      .subscribe({
        next: () => {
          this.fetchColors();
          this.editRow = null;
          this.resetForm();
        },
        error: error => {
          console.error('Error al actualizar los colores:', error);
          // this.router.navigate(['/login']);
        }
      });
  }

  resetForm() {
    console.log('Reseteando formulario...');
    this.editRow = null;
    this.colors = ['#000000', '#FFFFFF', '#F596D3', '#D247BF', '#61DAFB'];
    console.log('Formulario reseteado. Colores:', this.colors);
  }

  // Force reset method to ensure editRow is null
  forceReset() {
    console.log('Force reset - editRow:', this.editRow, 'type:', typeof this.editRow);
    this.editRow = null;
    this.colors = ['#000000', '#FFFFFF', '#F596D3', '#D247BF', '#61DAFB'];
  }
}
