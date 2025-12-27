import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  fileName: string;
  originalName: string;
  path: string;
  size: number;
  createdAt: Date;
  // Image specific properties
  width?: number;
  height?: number;
  // Video specific properties
  duration?: number;
  format?: string;
  subtitles?: any[];
  audioTracks?: any[];
}

@Component({
  selector: 'app-media-carousel',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './media-carousel.html',
  styleUrl: './media-carousel.css'
})
export class MediaCarousel implements OnInit {
  mediaItems: MediaItem[] = [];
  currentIndex = 0;
  selectedItem: MediaItem | null = null;
  loading = true;
  error = '';
  
  // API URLs
  private imagesApiUrl = 'http://localhost:3000/images';
  private videosApiUrl = 'http://localhost:3000/videos';
  
  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
    this.loadMediaItems();
  }
  
  loadMediaItems(): void {
    this.loading = true;
    this.error = '';
    
    // Load images
    this.http.get<any>(this.imagesApiUrl).subscribe({
      next: (response) => {
        const images = response.images.map((image: any) => ({
          ...image,
          type: 'image' as const,
          createdAt: new Date(image.createdAt)
        }));
        
        // Load videos
        this.http.get<any>(this.videosApiUrl).subscribe({
          next: (response) => {
            const videos = response.videos.map((video: any) => ({
              ...video,
              type: 'video' as const,
              createdAt: new Date(video.createdAt)
            }));
            
            // Combine and sort by creation date (newest first)
            this.mediaItems = [...images, ...videos].sort((a, b) => 
              b.createdAt.getTime() - a.createdAt.getTime()
            );
            
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading videos:', error);
            this.error = 'Failed to load videos';
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading images:', error);
        this.error = 'Failed to load images';
        this.loading = false;
      }
    });
  }
  
  get visibleItems(): MediaItem[] {
    if (this.mediaItems.length === 0) return [];
    
    const itemCount = this.mediaItems.length;
    const items = [];
    
    // Get 3 items starting from currentIndex
    for (let i = 0; i < 3; i++) {
      const index = (this.currentIndex + i) % itemCount;
      items.push(this.mediaItems[index]);
    }
    
    return items;
  }
  
  next(): void {
    if (this.mediaItems.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.mediaItems.length;
  }
  
  previous(): void {
    if (this.mediaItems.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.mediaItems.length) % this.mediaItems.length;
  }
  
  showDetails(item: MediaItem): void {
    this.selectedItem = item;
  }
  
  closeDetails(): void {
    this.selectedItem = null;
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  formatTime(seconds: number | undefined): string {
    if (seconds === undefined || seconds === null) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
