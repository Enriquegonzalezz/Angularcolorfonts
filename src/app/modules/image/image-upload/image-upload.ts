import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Cropper from 'cropperjs';
import { HttpClient, HttpClientModule, HttpEventType } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

interface ImageData {
  id: number;
  imageUrl: string;
  originalName: string;
  fileName: string;
  size: number;
  width: number;
  height: number;
  mimeType: string;
  isCropped: boolean;
  characteristics: any;
  selected: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.css'
})
export class ImageUpload implements OnInit {
  @ViewChild('imageElement', { static: false }) imageElement!: ElementRef;
  
  imageFile: File | null = null;
  imagePreview: string | null = null;
  originalImagePreview: string | null = null;
  cropper: any = null;
  isCropping = false;
  
  // Image metadata
  imageName = '';
  imageSize = 0;
  imageWidth = 0;
  imageHeight = 0;
  
  // Original image data (for comparison)
  originalImageSize = 0;
  originalImageWidth = 0;
  originalImageHeight = 0;
  
  // Crop data
  cropData: any = null;
  isCropped = false;
  
  // Upload status
  isUploading = false;
  uploadProgress = 0;
  uploadSuccess = false;
  uploadError = '';
  uploadedImageUrl = '';
  
  // User images list
  userImages: ImageData[] = [];
  isLoadingImages = false;
  
  // User ID from auth service
  userId: number | null = null;
  
  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Verificar autenticación y obtener ID del usuario
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.userId = this.authService.getUserId();
    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadUserImages();
  }
  
  loadUserImages(): void {
    if (!this.userId) {
      console.error('No user ID available');
      return;
    }
    
    this.isLoadingImages = true;
    this.http.get<{images: ImageData[]}>(`http://localhost:3000/images/user/${this.userId}`)
      .subscribe({
        next: (response) => {
          this.userImages = response.images;
          this.isLoadingImages = false;
        },
        error: (error) => {
          console.error('Error loading images:', error);
          this.isLoadingImages = false;
        }
      });
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];
      this.imageName = this.imageFile.name;
      this.imageSize = this.imageFile.size;
      this.isCropped = false;
      this.cropData = null;

      // Crear previsualización
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;

        // Obtener dimensiones
        const img = new Image();
        img.onload = () => {
          this.imageWidth = img.width;
          this.imageHeight = img.height;
          // Guardar datos originales para comparación
          this.originalImageSize = this.imageFile!.size;
          this.originalImageWidth = img.width;
          this.originalImageHeight = img.height;
          // Guardar la vista previa original
          this.originalImagePreview = reader.result as string;
          console.log('Dimensiones de imagen cargada:', this.imageWidth, 'x', this.imageHeight);
        };
        img.onerror = () => {
          console.error('Error cargando imagen para obtener dimensiones');
          // Valores por defecto si no se pueden obtener las dimensiones
          this.imageWidth = 800;
          this.imageHeight = 600;
          this.originalImageWidth = 800;
          this.originalImageHeight = 600;
        };
        img.src = this.imagePreview;
      };
      reader.readAsDataURL(this.imageFile);
    }
  }
  
  startCropping(): void {
    this.isCropping = true;
    this.cropData = null; // Reset crop data
    
    setTimeout(() => {
      if (
        this.imageElement &&
        this.imageElement.nativeElement &&
        this.imagePreview &&
        this.imageElement.nativeElement.tagName === 'IMG' &&
        this.imageElement.nativeElement.src
      ) {
        try {
          console.log('Inicializando cropper...');
          this.cropper = new Cropper(this.imageElement.nativeElement, {
            viewMode: 1, // Restrict the crop box to not exceed the size of the canvas
            dragMode: 'move', // Allow moving the image
            autoCropArea: 0.8, // Set the crop box size to 80% of the image
            restore: false, // Don't restore the cropped area after resize
            guides: true, // Show the dashed lines for the crop box
            center: true, // Show the center indicator for the crop box
            highlight: true, // Show the white borders above the crop box
            cropBoxMovable: true, // Allow to move the crop box
            cropBoxResizable: true, // Allow to resize the crop box
            toggleDragModeOnDblclick: false, // Disable toggling drag mode on double click
            ready: () => {
              console.log('✅ Cropper inicializado correctamente');
            },
            crop: (event: any) => {
              // Store crop data for later use
              this.cropData = {
                x: event.detail.x,
                y: event.detail.y,
                width: event.detail.width,
                height: event.detail.height,
                rotate: event.detail.rotate || 0,
                scaleX: event.detail.scaleX || 1,
                scaleY: event.detail.scaleY || 1
              };
              console.log('Datos de recorte actualizados:', this.cropData);
            }
          } as any);
        } catch (err) {
          console.error('❌ Error initializing cropper:', err);
          this.isCropping = false;
        }
      } else {
        console.error('❌ No valid image element for cropper');
        this.isCropping = false;
      }
    }, 300); // Aumentar el tiempo para asegurar que la imagen esté cargada
  }

  applyCrop(): void {
    if (!this.cropper) {
      console.error('Cropper instance not found');
      this.isCropping = false;
      return;
    }
    
    try {
      const cropperInstance: any = this.cropper;
      
      // Verificar que el cropper esté listo
      if (!cropperInstance.getCroppedCanvas) {
        console.error('Cropper not ready or getCroppedCanvas method not available');
        this.isCropping = false;
        return;
      }
      
      // Obtener datos del recorte actual
      const cropData = cropperInstance.getData();
      console.log('Datos del recorte obtenidos:', cropData);
      
      // Obtener el canvas recortado con las dimensiones reales del recorte
      const canvas: HTMLCanvasElement = cropperInstance.getCroppedCanvas({
        width: Math.round(cropData.width),
        height: Math.round(cropData.height),
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      });
      
      if (!canvas) {
        console.error('Failed to get cropped canvas');
        this.isCropping = false;
        return;
      }
      
      console.log('Canvas obtenido:', canvas.width, 'x', canvas.height);
      
      // Convertir canvas a blob
      canvas.toBlob((blob: Blob | null) => {
        if (!blob) {
          console.error('Failed to create blob from canvas');
          this.isCropping = false;
          return;
        }
        
        // Crear nuevo archivo con la imagen recortada
        const croppedFileName = `cropped_${Date.now()}_${this.imageName}`;
        this.imageFile = new File([blob], croppedFileName, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        
        // Actualizar metadatos con los datos de la imagen RECORTADA
        this.imageSize = this.imageFile.size;
        this.imagePreview = canvas.toDataURL('image/jpeg', 0.9);
        this.imageWidth = canvas.width;  // Dimensiones de la imagen recortada
        this.imageHeight = canvas.height; // Dimensiones de la imagen recortada
        this.isCropped = true;
        
        // Actualizar datos del recorte con las dimensiones reales
        this.cropData = {
          x: cropData.x,
          y: cropData.y,
          width: cropData.width,
          height: cropData.height,
          rotate: cropData.rotate || 0,
          scaleX: cropData.scaleX || 1,
          scaleY: cropData.scaleY || 1
        };
        
        console.log('✅ Recorte aplicado exitosamente:');
        console.log('   📁 Archivo:', croppedFileName);
        console.log('   📏 Dimensiones recortadas:', this.imageWidth, 'x', this.imageHeight);
        console.log('   💾 Tamaño:', this.formatFileSize(this.imageSize));
        console.log('   ✂️ Datos de recorte:', this.cropData);
        
        // Destruir el cropper
        try {
          if (cropperInstance.destroy) {
            cropperInstance.destroy();
          }
        } catch (e) {
          console.error('Error destroying cropper:', e);
        }
        
        this.cropper = null;
        this.isCropping = false;
        this.cdr.detectChanges();
        
      }, 'image/jpeg', 0.9); // 90% quality
      
    } catch (error) {
      console.error('Error applying crop:', error);
      this.cropper = null;
      this.isCropping = false;
    }
  }
  
  cancelCrop(): void {
    if (this.cropper) {
      try {
        const cropperInstance: any = this.cropper;
        if (typeof cropperInstance.destroy === 'function') {
          cropperInstance.destroy();
        }
      } catch (e) {
        console.error('Error destroying cropper:', e);
      }
      this.cropper = null;
    }
    this.isCropping = false;
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  uploadImage(): void {
    if (!this.imageFile) {
      this.uploadError = 'No image selected';
      return;
    }
    
    // Validar que tenemos dimensiones válidas
    if (this.imageWidth <= 0 || this.imageHeight <= 0) {
      console.warn('Dimensiones inválidas, usando valores por defecto');
      this.imageWidth = this.imageWidth || 800;
      this.imageHeight = this.imageHeight || 600;
    }
    
    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadSuccess = false;
    this.uploadError = '';
    
    // Create form data with additional metadata
    const formData = new FormData();
    formData.append('image', this.imageFile);
    formData.append('userId', this.userId!.toString());
    formData.append('isCropped', this.isCropped.toString());
    
    // Agregar datos del recorte si la imagen fue recortada
    if (this.isCropped && this.cropData) {
      formData.append('cropData', JSON.stringify(this.cropData));
      console.log('📤 Enviando datos de recorte al backend:', this.cropData);
    } else if (this.isCropped) {
      console.warn('⚠️ Imagen marcada como recortada pero no hay datos de recorte');
    }
    
    // Agregar metadatos adicionales
    // Si la imagen está recortada, estas son las dimensiones de la imagen recortada
    formData.append('originalWidth', this.imageWidth.toString());
    formData.append('originalHeight', this.imageHeight.toString());
    formData.append('originalSize', this.imageSize.toString());
    
    console.log('Subiendo imagen:', {
      fileName: this.imageFile.name,
      size: this.imageFile.size,
      width: this.imageWidth,
      height: this.imageHeight,
      isCropped: this.isCropped,
      cropData: this.cropData
    });
    
    // Upload to backend
    this.http.post('http://localhost:3000/images/upload', formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.Response) {
          this.isUploading = false;
          this.uploadSuccess = true;
          if (event.body && event.body.image) {
            this.uploadedImageUrl = event.body.image.imageUrl;
            console.log('Imagen subida exitosamente:', event.body.image);
            // Reload user images after successful upload
            this.loadUserImages();
          }
        } else if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          }
        }
      },
      error: (error) => {
        this.isUploading = false;
        this.uploadError = error?.error?.message || error?.message || 'Upload failed';
        console.error('Upload error:', error);
      }
    });
  }
  
  deleteImage(imageId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      this.http.delete(`http://localhost:3000/images/${imageId}`)
        .subscribe({
          next: () => {
            console.log('Imagen eliminada exitosamente');
            this.loadUserImages(); // Reload the list
          },
          error: (error) => {
            console.error('Error deleting image:', error);
            alert('Error al eliminar la imagen');
          }
        });
      }
  }
  
  toggleImageSelection(imageId: number): void {
    this.http.post(`http://localhost:3000/images/${imageId}/toggle-selection`, {
      userId: this.userId
    }).subscribe({
      next: (response: any) => {
        console.log('Selección de imagen actualizada:', response.message);
        this.loadUserImages(); // Reload the list
      },
      error: (error) => {
        console.error('Error toggling image selection:', error);
        alert('Error al cambiar la selección de la imagen');
      }
    });
  }
  
  resetUpload(): void {
    this.imageFile = null;
    this.imagePreview = null;
    this.originalImagePreview = null;
    this.imageName = '';
    this.imageSize = 0;
    this.imageWidth = 0;
    this.imageHeight = 0;
    this.originalImageSize = 0;
    this.originalImageWidth = 0;
    this.originalImageHeight = 0;
    this.isCropped = false;
    this.cropData = null;
    this.uploadSuccess = false;
    this.uploadedImageUrl = '';
    this.uploadError = '';
  }
}
