/**
 * Utility class for generating WebVTT subtitle files
 */
export class SubtitleGenerator {
  /**
   * Generate WebVTT content from subtitle data
   * @param {Array<{startTime: number, endTime: number, text: string}>} subtitleData Array of subtitle entries with start time, end time and text
   * @param {Object} styles Optional CSS styles to apply to the subtitles
   * @param {string} styles.color Text color
   * @param {string} styles.backgroundColor Background color
   * @param {string} styles.fontSize Font size
   * @param {string} styles.fontFamily Font family
   * @returns {string} WebVTT content as string
   */
  static generateVTT(subtitleData, styles) {
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
   * @param {number} seconds Time in seconds
   * @returns {string} Formatted time string
   */
  static formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  }
  
  /**
   * Create a Blob URL for a WebVTT subtitle file
   * @param {string} vttContent WebVTT content as string
   * @returns {string} Blob URL that can be used in a track element
   */
  static createBlobUrl(vttContent) {
    const blob = new Blob([vttContent], { type: 'text/vtt' });
    return URL.createObjectURL(blob);
  }
}
