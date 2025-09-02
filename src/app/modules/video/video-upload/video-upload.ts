import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpEventType, HttpErrorResponse, HttpClientModule } from '@angular/common/http';
import { SubtitleGenerator } from '../utils/subtitle-generator';

interface SubtitleEntry {
  startTime: number;
  endTime: number;
  text: string;
}

interface Subtitle {
  id: string;
  language: 'en' | 'es';
  text: string;
  entries: SubtitleEntry[];
  color: string;
  backgroundColor: string;
  fontSize: string;
  fontFamily: string;
  vttUrl?: string;
}

interface AudioTrack {
  id: string;
  language: 'en' | 'es';
  file: File | null;
  url?: string;
  mimeType?: string;
}

@Component({
  selector: 'app-video-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './video-upload.html',
  styleUrl: './video-upload.css'
})
export class VideoUpload implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  
  videoFile: File | null = null;
  videoPreview: string | null = null;
  isPlaying = false;
  
  // Video metadata
  videoName = '';
  videoSize = 0;
  videoDuration = 0;
  videoFormat = '';
  
  // Upload status
  uploadProgress = 0;
  uploadSuccess = false;
  uploadError = '';
  isUploading = false;
  uploadedVideoUrl = '';
  
  // Subtitles
  subtitles: Subtitle[] = [];
  currentSubtitle: Subtitle | null = null;
  editingSubtitle = false;
  
  // Audio tracks
  audioTracks: AudioTrack[] = [];
  
  // Font options
  fontFamilies = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia'];
  fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
  
  // API URL
  private apiUrl = 'http://localhost:3000/videos';
  
  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
    // Initialize with empty subtitles for both languages
    this.subtitles = [
      {
        id: 'en-subtitle',
        language: 'en',
        text: '',
        entries: [],
        color: '#ffffff',
        backgroundColor: '#000000',
        fontSize: '16px',
        fontFamily: 'Arial'
      },
      {
        id: 'es-subtitle',
        language: 'es',
        text: '',
        entries: [],
        color: '#ffffff',
        backgroundColor: '#000000',
        fontSize: '16px',
        fontFamily: 'Arial'
      }
    ];
    
    // Initialize with empty audio tracks for both languages
    this.audioTracks = [
      {
        id: 'en-audio',
        language: 'en',
        file: null
      },
      {
        id: 'es-audio',
        language: 'es',
        file: null
      }
    ];
  }
  
  ngOnDestroy(): void {
    // Clean up any blob URLs to prevent memory leaks
    this.subtitles.forEach(subtitle => {
      if (subtitle.vttUrl) {
        URL.revokeObjectURL(subtitle.vttUrl);
      }
    });
    
    this.audioTracks.forEach(track => {
      if (track.url) {
        URL.revokeObjectURL(track.url);
      }
    });
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      this.videoFile = input.files[0];
      this.videoName = this.videoFile.name;
      this.videoSize = this.videoFile.size;
      this.videoFormat = this.videoFile.name.split('.').pop() || '';
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        this.videoPreview = reader.result as string;
        
        // Get video duration after the video is loaded
        setTimeout(() => {
          if (this.videoElement && this.videoElement.nativeElement) {
            this.videoElement.nativeElement.onloadedmetadata = () => {
              this.videoDuration = this.videoElement.nativeElement.duration;
            };
          }
        }, 100);
      };
      reader.readAsDataURL(this.videoFile);
    }
  }
  
  onAudioSelected(event: Event, language: 'en' | 'es'): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const audioFile = input.files[0];
      const audioTrack = this.audioTracks.find(track => track.language === language);
      
      if (audioTrack) {
        // Clean up previous URL if exists
        if (audioTrack.url) {
          URL.revokeObjectURL(audioTrack.url);
        }
        
        audioTrack.file = audioFile;
        audioTrack.mimeType = audioFile.type;
      }
    }
  }
  
  processAudioTrack(language: 'en' | 'es'): void {
    const audioTrack = this.audioTracks.find(track => track.language === language);
    
    if (audioTrack && audioTrack.file) {
      // Create a blob URL for the audio file
      audioTrack.url = URL.createObjectURL(audioTrack.file);
    }
  }
  
  togglePlayPause(): void {
    if (this.videoElement && this.videoElement.nativeElement) {
      if (this.isPlaying) {
        this.videoElement.nativeElement.pause();
      } else {
        this.videoElement.nativeElement.play();
      }
      this.isPlaying = !this.isPlaying;
    }
  }
  
  editSubtitle(language: 'en' | 'es'): void {
    const subtitle = this.subtitles.find(sub => sub.language === language);
    if (subtitle) {
      // Create a deep copy to avoid modifying the original until save
      this.currentSubtitle = { 
        ...subtitle,
        entries: subtitle.entries.map(entry => ({ ...entry }))
      };
      this.editingSubtitle = true;
    }
  }
  
  addSubtitleEntry(): void {
    if (this.currentSubtitle) {
      // Add a new entry with default values
      this.currentSubtitle.entries.push({
        startTime: 0,
        endTime: this.videoDuration > 5 ? 5 : this.videoDuration,
        text: ''
      });
    }
  }
  
  removeSubtitleEntry(index: number): void {
    if (this.currentSubtitle && this.currentSubtitle.entries.length > index) {
      this.currentSubtitle.entries.splice(index, 1);
    }
  }
  
  generateVTT(language: 'en' | 'es'): void {
    const subtitle = this.subtitles.find(sub => sub.language === language);
    
    if (subtitle && subtitle.entries.length > 0) {
      // Clean up previous URL if exists
      if (subtitle.vttUrl) {
        URL.revokeObjectURL(subtitle.vttUrl);
      }
      
      // Generate VTT content
      const vttContent = SubtitleGenerator.generateVTT(
        subtitle.entries,
        {
          color: subtitle.color,
          backgroundColor: subtitle.backgroundColor,
          fontSize: subtitle.fontSize,
          fontFamily: subtitle.fontFamily
        }
      );
      
      // Create blob URL
      subtitle.vttUrl = SubtitleGenerator.createBlobUrl(vttContent);
    }
  }
  
  previewSubtitles(language: 'en' | 'es'): void {
    const subtitle = this.subtitles.find(sub => sub.language === language);
    
    if (subtitle && subtitle.vttUrl && this.videoElement) {
      // Reset video to beginning
      this.videoElement.nativeElement.currentTime = 0;
      // Start playing with subtitles
      this.videoElement.nativeElement.play();
    }
  }
  
  saveSubtitle(): void {
    if (this.currentSubtitle) {
      const index = this.subtitles.findIndex(sub => sub.language === this.currentSubtitle?.language);
      if (index !== -1) {
        // Update the subtitle with the edited version
        this.subtitles[index] = { ...this.currentSubtitle };
        
        // If there are entries, automatically generate the VTT
        if (this.currentSubtitle.entries.length > 0) {
          this.generateVTT(this.currentSubtitle.language);
        }
      }
      this.currentSubtitle = null;
      this.editingSubtitle = false;
    }
  }
  
  cancelEditSubtitle(): void {
    this.currentSubtitle = null;
    this.editingSubtitle = false;
  }
  
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  uploadVideo(): void {
    if (!this.videoFile) {
      this.uploadError = 'No se ha seleccionado ningún video';
      return;
    }
    
    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadError = '';
    
    // Create form data
    const formData = new FormData();
    formData.append('video', this.videoFile);
    
    // Upload video
    this.http.post(`${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          const response = event.body as any;
          this.uploadSuccess = true;
          this.uploadedVideoUrl = response.video.path;
          
          // Upload subtitles for each language
          this.subtitles.forEach(subtitle => {
            if (subtitle.entries && subtitle.entries.length > 0) {
              this.uploadSubtitle(response.video.id, subtitle);
            }
          });
          
          // Upload audio tracks for each language
          this.audioTracks.forEach(track => {
            if (track.file) {
              this.uploadAudioTrack(response.video.id, track);
            }
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isUploading = false;
        this.uploadError = `Error en la subida: ${error.message}`;
        console.error('Error uploading video:', error);
      },
      complete: () => {
        this.isUploading = false;
      }
    });
  }
  
  resetVideo(): void {
    // Clean up any blob URLs
    this.subtitles.forEach(subtitle => {
      if (subtitle.vttUrl) {
        URL.revokeObjectURL(subtitle.vttUrl);
      }
    });
    
    this.audioTracks.forEach(track => {
      if (track.url) {
        URL.revokeObjectURL(track.url);
      }
    });
    
    // Reset all state
    this.videoPreview = null;
    this.videoFile = null;
    this.videoName = '';
    this.videoSize = 0;
    this.videoDuration = 0;
    this.videoFormat = '';
    
    // Reset subtitles and audio tracks
    this.subtitles.forEach(subtitle => {
      subtitle.text = '';
      subtitle.entries = [];
      subtitle.vttUrl = undefined;
    });
    
    this.audioTracks.forEach(track => {
      track.file = null;
      track.url = undefined;
      track.mimeType = undefined;
    });
  }
  
  private uploadSubtitle(videoId: string, subtitle: Subtitle): void {
    // Create a VTT file if not already created
    if (!subtitle.vttUrl && subtitle.entries.length > 0) {
      this.generateVTT(subtitle.language);
    }
    
    // Prepare subtitle data for upload
    const subtitleData = {
      language: subtitle.language,
      entries: subtitle.entries,
      color: subtitle.color,
      backgroundColor: subtitle.backgroundColor,
      fontSize: subtitle.fontSize,
      fontFamily: subtitle.fontFamily
    };
    
    this.http.post(`${this.apiUrl}/${videoId}/subtitles`, subtitleData)
      .subscribe({
        next: (response) => {
          console.log(`${subtitle.language} subtitle uploaded successfully:`, response);
        },
        error: (error) => {
          console.error(`Error uploading ${subtitle.language} subtitle:`, error);
        }
      });
  }
  
  private uploadAudioTrack(videoId: string, audioTrack: AudioTrack): void {
    if (!audioTrack.file) return;
    
    const formData = new FormData();
    formData.append('audio', audioTrack.file);
    formData.append('language', audioTrack.language);
    
    this.http.post(`${this.apiUrl}/${videoId}/audio`, formData)
      .subscribe({
        next: (response) => {
          console.log(`${audioTrack.language} audio track uploaded successfully:`, response);
        },
        error: (error) => {
          console.error(`Error uploading ${audioTrack.language} audio track:`, error);
        }
      });
  }
}
