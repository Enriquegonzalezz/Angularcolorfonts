import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Cropper from 'cropperjs';
import { HttpClient, HttpClientModule, HttpEventType } from '@angular/common/http';

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
  cropper: any = null;
  isCropping = false;
  
  // Image metadata
  imageName = '';
  imageSize = 0;
  imageWidth = 0;
  imageHeight = 0;
  
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
  
  // User ID (for now hardcoded, should come from auth service)
  userId = 1;
  
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}
  
  ngOnInit(): void {
    this.loadUserImages();
  }
  
  loadUserImages(): void {
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
        };
        img.src = this.imagePreview;
      };
      reader.readAsDataURL(this.imageFile);
    }
  }
  
  startCropping(): void {
    this.isCropping = true;
    setTimeout(() => {
      if (
        this.imageElement &&
        this.imageElement.nativeElement &&
        this.imagePreview &&
        this.imageElement.nativeElement.tagName === 'IMG' &&
        this.imageElement.nativeElement.src
      ) {
        try {
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
              console.log('Cropper ready');
            },
            crop: (event: any) => {
              // Store crop data for later use
              this.cropData = {
                x: event.detail.x,
                y: event.detail.y,
                width: event.detail.width,
                height: event.detail.height,
                rotate: event.detail.rotate,
                scaleX: event.detail.scaleX,
                scaleY: event.detail.scaleY
              };
            }
          } as any);
        } catch (err) {
          console.error('Error initializing cropper:', err);
          this.isCropping = false;
        }
      } else {
        console.error('No valid image element for cropper');
        this.isCropping = false;
      }
    }, 200);
  }

  applyCrop(): void {
    if (!this.cropper) {
      console.error('Cropper instance not found');
      this.isCropping = false;
      return;
    }
    
    try {
      const cropperInstance: any = this.cropper;
      if (typeof cropperInstance.getCroppedCanvas !== 'function') {
        console.error('No suitable canvas method found on cropper instance');
        this.isCropping = false;
        return;
      }
      
      const canvas: HTMLCanvasElement = cropperInstance.getCroppedCanvas();
      if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        console.error('Failed to get canvas from cropper');
        this.isCropping = false;
        return;
      }
      
      const finishCrop = (blob: Blob) => {
        // Create new file with cropped image
        const croppedFileName = `cropped_${this.imageName}`;
        this.imageFile = new File([blob], croppedFileName, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        
        this.imageSize = this.imageFile.size;
        this.imagePreview = canvas.toDataURL('image/jpeg');
        this.imageWidth = canvas.width;
        this.imageHeight = canvas.height;
        this.isCropped = true;
        
        console.log('Recorte aplicado:', {
          imagePreview: this.imagePreview,
          imageWidth: this.imageWidth,
          imageHeight: this.imageHeight,
          imageSize: this.imageSize,
          cropData: this.cropData
        });
        
        this.cdr.detectChanges();
        
        try {
          if (typeof cropperInstance.destroy === 'function') {
            cropperInstance.destroy();
          }
        } catch (e) {
          console.error('Error destroying cropper:', e);
        }
        
        this.cropper = null;
        this.isCropping = false;
      };
      
      if (typeof canvas.toBlob === 'function') {
        canvas.toBlob((blob: Blob | null) => {
          if (blob) finishCrop(blob);
          else {
            console.error('Failed to create blob from canvas');
            this.isCropping = false;
          }
        }, 'image/jpeg', 0.9); // 90% quality
      } else {
        // Fallback: usar toDataURL y convertir a Blob manualmente
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)![1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        for (let i = 0; i < n; i++) {
          u8arr[i] = bstr.charCodeAt(i);
        }
        const blob = new Blob([u8arr], { type: mime });
        finishCrop(blob);
      }
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
    
    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadSuccess = false;
    this.uploadError = '';
    
    // Create form data with additional metadata
    const formData = new FormData();
    formData.append('image', this.imageFile);
    formData.append('userId', this.userId.toString());
    formData.append('isCropped', this.isCropped.toString());
    
    if (this.cropData) {
      formData.append('cropData', JSON.stringify(this.cropData));
    }
    
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
        this.uploadError = error?.message || 'Upload failed';
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
    this.imageName = '';
    this.imageSize = 0;
    this.imageWidth = 0;
    this.imageHeight = 0;
    this.isCropped = false;
    this.cropData = null;
    this.uploadSuccess = false;
      this.uploadedImageUrl = '';
      this.uploadError = '';
  }
}
