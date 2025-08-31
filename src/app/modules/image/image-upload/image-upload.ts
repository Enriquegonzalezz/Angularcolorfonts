import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Cropper from 'cropperjs';
import { HttpClient, HttpClientModule, HttpEventType } from '@angular/common/http';

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
  cropper: any = null; // Using any type to avoid TypeScript errors
  isCropping = false;
  
  // Image metadata
  imageName = '';
  imageSize = 0;
  imageWidth = 0;
  imageHeight = 0;
  
  // Upload status
  isUploading = false;
  uploadProgress = 0;
  uploadSuccess = false;
  uploadError = '';
  uploadedImageUrl = '';
  
  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {}
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];
      this.imageName = this.imageFile.name;
      this.imageSize = this.imageFile.size;
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        
        // Get image dimensions
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
    
    // Initialize cropper after view is updated
    setTimeout(() => {
      if (this.imageElement && this.imageElement.nativeElement) {
        // Use any type for options to avoid TypeScript errors
        const options: any = {
          viewMode: 1,
          dragMode: 'move',
          autoCropArea: 0.8,
          responsive: true,
          guides: true,
          highlight: false,
          cropBoxMovable: true,
          cropBoxResizable: true,
          toggleDragModeOnDblclick: true,
        };
        
        this.cropper = new Cropper(this.imageElement.nativeElement, options);
      }
    }, 100);
  }
  
  applyCrop(): void {
    if (this.cropper) {
      try {
        // Access the cropper instance directly
        // Using any type to bypass TypeScript restrictions
        const cropperInstance: any = this.cropper;
        
        // Get cropped canvas - this method might vary depending on cropperjs version
        // Try different method names that might exist
        let canvas: HTMLCanvasElement | null = null;
        
        if (typeof cropperInstance.getCroppedCanvas === 'function') {
          canvas = cropperInstance.getCroppedCanvas();
        } else if (typeof cropperInstance.getCropperCanvas === 'function') {
          canvas = cropperInstance.getCropperCanvas();
        } else {
          console.error('No suitable canvas method found on cropper instance');
          return;
        }
        
        if (!canvas) {
          console.error('Failed to get canvas from cropper');
          return;
        }
        
        // Convert to blob
        canvas.toBlob((blob: Blob | null) => {
          if (blob) {
            // Create new file from blob
            const croppedFile = new File([blob], this.imageName, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            
            this.imageFile = croppedFile;
            this.imageSize = croppedFile.size;
            this.imagePreview = canvas ? canvas.toDataURL('image/jpeg') : '';
            this.imageWidth = canvas ? canvas.width : 0;
            this.imageHeight = canvas ? canvas.height : 0;
            
            // Clean up cropper
            try {
              if (typeof cropperInstance.destroy === 'function') {
                cropperInstance.destroy();
              }
            } catch (e) {
              console.error('Error destroying cropper:', e);
            }
            
            this.cropper = null;
            this.isCropping = false;
          }
        }, 'image/jpeg');
      } catch (error) {
        console.error('Error applying crop:', error);
        this.cropper = null;
        this.isCropping = false;
      }
    }
  }
  
  cancelCrop(): void {
    if (this.cropper) {
      try {
        // Try to call destroy if it exists
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
    
    // Create form data
    const formData = new FormData();
    formData.append('image', this.imageFile);
    
    // Upload to backend
    this.http.post('http://localhost:3000/images/upload', formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.Response) {
          this.isUploading = false;
          this.uploadSuccess = true;
          if (event.body && event.body.imageUrl) {
            this.uploadedImageUrl = event.body.imageUrl;
          }
        } else if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          }
        }
      },
      error: (error) => {
        this.isUploading = false;
        this.uploadError = error.message || 'Upload failed';
        console.error('Upload error:', error);
      }
    });
  }
}
