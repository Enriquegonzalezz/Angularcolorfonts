/**
 * Utility class for generating WebVTT subtitle files
 */
export class SubtitleGenerator {
  /**
   * Generate WebVTT content from subtitle data
   * @param subtitleData Array of subtitle entries with start time, end time and text
   * @param styles Optional CSS styles to apply to the subtitles
   * @returns WebVTT content as string
   */
  static generateVTT(subtitleData: Array<{
    startTime: number,
    endTime: number,
    text: string
  }>, styles?: {
    color?: string,
    backgroundColor?: string,
    fontSize?: string,
    fontFamily?: string
  }): string {
    // WebVTT header
    let vttContent = 'WEBVTT\n\n';
    
    // Add style block if styles are provided
    if (styles) {
      vttContent += '::cue {\n';
      if (styles.color) vttContent += `  color: ${styles.color};\n`;
      if (styles.backgroundColor) vttContent += `  background-color: ${styles.backgroundColor};\n`;
      if (styles.fontSize) vttContent += `  font-size: ${styles.fontSize};\n`;
      if (styles.fontFamily) vttContent += `  font-family: ${styles.fontFamily};\n`;
      vttContent += '}\n\n';
    }
    
    // Add subtitle cues
    subtitleData.forEach((subtitle, index) => {
      // Format times as HH:MM:SS.mmm
      const startTime = this.formatTime(subtitle.startTime);
      const endTime = this.formatTime(subtitle.endTime);
      
      vttContent += `${index + 1}\n`;
      vttContent += `${startTime} --> ${endTime}\n`;
      vttContent += `${subtitle.text}\n\n`;
    });
    
    return vttContent;
  }
  
  /**
   * Format time in seconds to WebVTT time format (HH:MM:SS.mmm)
   * @param seconds Time in seconds
   * @returns Formatted time string
   */
  static formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  }
  
  /**
   * Create a Blob URL for a WebVTT subtitle file
   * @param vttContent WebVTT content as string
   * @returns Blob URL that can be used in a track element
   */
  static createBlobUrl(vttContent: string): string {
    const blob = new Blob([vttContent], { type: 'text/vtt' });
    return URL.createObjectURL(blob);
  }
}
