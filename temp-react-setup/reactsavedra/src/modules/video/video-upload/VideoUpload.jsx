import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { SubtitleGenerator } from '../utils/subtitle-generator';
import TangramLoader from '../../../components/tangram-loader/TangramLoader';
import './VideoUpload.css';

/**
 * VideoUpload Component - Permite subir videos con subtítulos y pistas de audio
 */
const VideoUpload = () => {
  // Referencias
  const videoRef = useRef(null);
  
  // Estado para el archivo de video
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Metadatos del video
  const [videoName, setVideoName] = useState('');
  const [videoSize, setVideoSize] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoFormat, setVideoFormat] = useState('');
  
  // Estado de la subida
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
  
  // Subtítulos
  const [subtitles, setSubtitles] = useState([
    {
      id: 'en-subtitle',
      language: 'en',
      text: '',
      entries: [],
      color: '#ffffff',
      backgroundColor: '#000000',
      fontSize: '16px',
      fontFamily: 'Arial',
      vttUrl: undefined
    },
    {
      id: 'es-subtitle',
      language: 'es',
      text: '',
      entries: [],
      color: '#ffffff',
      backgroundColor: '#000000',
      fontSize: '16px',
      fontFamily: 'Arial',
      vttUrl: undefined
    }
  ]);
  
  const [currentSubtitle, setCurrentSubtitle] = useState(null);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  
  // Pistas de audio
  const [audioTracks, setAudioTracks] = useState([
    {
      id: 'en-audio',
      language: 'en',
      file: null,
      url: undefined,
      mimeType: undefined
    },
    {
      id: 'es-audio',
      language: 'es',
      file: null,
      url: undefined,
      mimeType: undefined
    }
  ]);
  
  // Opciones de fuente
  const fontFamilies = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia'];
  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
  
  // URL de la API
  const apiUrl = 'http://localhost:3000/videos';
  
  // Limpiar URLs de blob al desmontar el componente
  useEffect(() => {
    return () => {
      // Limpiar URLs de blob para evitar fugas de memoria
      subtitles.forEach(subtitle => {
        if (subtitle.vttUrl) {
          URL.revokeObjectURL(subtitle.vttUrl);
        }
      });
      
      audioTracks.forEach(track => {
        if (track.url) {
          URL.revokeObjectURL(track.url);
        }
      });
    };
  }, []);
  
  // Manejador para la selección de archivo de video
  const handleFileSelected = (event) => {
    const input = event.target;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      setVideoFile(file);
      setVideoName(file.name);
      setVideoSize(file.size);
      setVideoFormat(file.name.split('.').pop() || '');
      
      // Crear vista previa
      const reader = new FileReader();
      reader.onload = () => {
        setVideoPreview(reader.result);
        
        // Obtener duración del video después de que se cargue
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              setVideoDuration(videoRef.current.duration);
            };
          }
        }, 100);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Manejador para la selección de archivo de audio
  const handleAudioSelected = (event, language) => {
    const input = event.target;
    
    if (input.files && input.files.length > 0) {
      const audioFile = input.files[0];
      
      // Verificar si el archivo de audio es compatible
      if (!audioFile.type.startsWith('audio/')) {
        alert('Por favor, seleccione un archivo de audio válido');
        return;
      }
      
      setAudioTracks(prevTracks => {
        return prevTracks.map(track => {
          if (track.language === language) {
            // Limpiar URL anterior si existe
            if (track.url) {
              URL.revokeObjectURL(track.url);
            }
            
            return {
              ...track,
              file: audioFile,
              mimeType: audioFile.type,
              name: audioFile.name,
              size: audioFile.size
            };
          }
          return track;
        });
      });
      
      // Procesar inmediatamente el audio para verificar compatibilidad
      setTimeout(() => processAudioTrack(language), 100);
    }
  };
  
  // Procesar pista de audio
  const processAudioTrack = (language) => {
    const track = audioTracks.find(t => t.language === language && t.file);
    
    if (!track || !track.file) return;
    
    // Crear un elemento de audio para verificar duración
    const audioElement = new Audio();
    const audioUrl = URL.createObjectURL(track.file);
    
    audioElement.onloadedmetadata = () => {
      const audioDuration = audioElement.duration;
      
      // Comparar con la duración del video
      if (videoDuration > 0 && Math.abs(audioDuration - videoDuration) > 5) {
        // Mostrar advertencia si la diferencia es mayor a 5 segundos
        alert(`Advertencia: La duración del audio (${formatTime(audioDuration)}) es diferente a la del video (${formatTime(videoDuration)}). El audio se reproducirá durante todo el video.`);
      }
      
      // Actualizar el estado con la URL y duración
      setAudioTracks(prevTracks => {
        return prevTracks.map(t => {
          if (t.language === language) {
            return {
              ...t,
              url: audioUrl,
              duration: audioDuration
            };
          }
          return t;
        });
      });
    };
    
    audioElement.onerror = () => {
      alert(`Error al procesar el archivo de audio: ${track.name}`);
      URL.revokeObjectURL(audioUrl);
    };
    
    // Cargar el audio para obtener metadatos
    audioElement.src = audioUrl;
  };
  
  // Alternar reproducción/pausa
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Activar/desactivar subtítulos
  const [activeSubtitles, setActiveSubtitles] = useState({
    en: true,  // Inglés activado por defecto
    es: false  // Español desactivado por defecto
  });
  
  // Función para activar/desactivar subtítulos por idioma
  const toggleSubtitles = (language) => {
    if (!videoRef.current) return;
    
    // Obtener todas las pistas de subtítulos
    const tracks = videoRef.current.textTracks;
    
    // Actualizar estado
    setActiveSubtitles(prev => {
      const newState = {
        ...prev,
        [language]: !prev[language]
      };
      
      // Aplicar cambios a las pistas de subtítulos
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (track.language === language) {
          // Activar o desactivar según el nuevo estado
          track.mode = newState[language] ? 'showing' : 'disabled';
        }
      }
      
      return newState;
    });
  };
  
  // Generar subtítulos automáticamente
  const generateAutomaticSubtitles = (language) => {
    // Aquí se implementaría la lógica para generar subtítulos automáticamente
    // Por ejemplo, usando una API de reconocimiento de voz o un servicio externo
    
    // Por ahora, generamos subtítulos de ejemplo para demostrar la funcionalidad
    const exampleSubtitles = [
      {
        startTime: 0,
        endTime: 5,
        text: language === 'en' ? 'This is an example subtitle' : 'Este es un subtítulo de ejemplo'
      },
      {
        startTime: 5,
        endTime: 10,
        text: language === 'en' ? 'Generated automatically' : 'Generado automáticamente'
      },
      {
        startTime: 10,
        endTime: 15,
        text: language === 'en' ? 'Using the TextTrack API' : 'Usando la API de TextTrack'
      }
    ];
    
    // Actualizar el estado con los subtítulos generados
    setSubtitles(prevSubtitles => {
      return prevSubtitles.map(sub => {
        if (sub.language === language) {
          return {
            ...sub,
            entries: exampleSubtitles
          };
        }
        return sub;
      });
    });
    
    // Aplicar los subtítulos al video
    setTimeout(() => generateSubtitles(language), 100);
  };
  
  // Generar subtítulos usando TextTrack API
  const generateSubtitles = (language) => {
    if (!videoRef.current) {
      console.error('Video no disponible para añadir subtítulos');
      return;
    }
    
    const subtitle = subtitles.find(sub => sub.language === language);
    if (!subtitle || !subtitle.entries || subtitle.entries.length === 0) {
      console.warn(`No hay entradas de subtítulos para el idioma ${language}`);
      return;
    }
    
    // Obtener todas las pistas de texto del video
    const textTracks = videoRef.current.textTracks;
    
    // Buscar si ya existe una pista para este idioma
    let track;
    for (let i = 0; i < textTracks.length; i++) {
      if (textTracks[i].language === language) {
        track = textTracks[i];
        break;
      }
    }
    
    // Si no existe, crear una nueva pista
    if (!track) {
      track = videoRef.current.addTextTrack(
        'subtitles',
        language === 'en' ? 'English' : 'Español',
        language
      );
    }
    
    // Limpiar pista existente
    while(track.cues && track.cues.length > 0) {
      track.removeCue(track.cues[0]);
    }
    
    // Añadir nuevas entradas de subtítulos
    subtitle.entries.forEach(entry => {
      const cue = new VTTCue(
        entry.startTime,
        entry.endTime,
        entry.text
      );
      
      // Aplicar estilos
      if (subtitle.color) cue.color = subtitle.color;
      if (subtitle.backgroundColor) cue.backgroundColor = subtitle.backgroundColor;
      if (subtitle.fontSize) cue.fontSize = subtitle.fontSize;
      if (subtitle.fontFamily) cue.fontFamily = subtitle.fontFamily;
      
      // Añadir a la pista
      track.addCue(cue);
    });
    
    // Activar la pista según el estado actual
    track.mode = activeSubtitles[language] ? 'showing' : 'hidden';
    
    // Actualizar estado para indicar que los subtítulos están activos
    setSubtitles(prevSubtitles => {
      return prevSubtitles.map(sub => {
        if (sub.language === language) {
          return {
            ...sub,
            vttUrl: true // Usamos vttUrl como indicador de que los subtítulos están activos
          };
        }
        return sub;
      });
    });
    
    console.log(`Subtítulos en ${language} generados correctamente con ${subtitle.entries.length} entradas`);
  };
  
  // Vista previa de subtítulos
  const previewSubtitles = (language) => {
    const subtitle = subtitles.find(sub => sub.language === language);
    
    if (subtitle && subtitle.vttUrl && videoRef.current) {
      // Asegurarse de que los subtítulos estén activos
      toggleSubtitles(language, true);
      
      // Reiniciar video al principio
      videoRef.current.currentTime = 0;
      
      // Comenzar reproducción con subtítulos
      videoRef.current.play();
      setIsPlaying(true);
    }
  };
  
  // Guardar subtítulo
  const saveSubtitle = () => {
    if (currentSubtitle) {
      setSubtitles(prevSubtitles => {
        return prevSubtitles.map(sub => {
          if (sub.language === currentSubtitle.language) {
            // Actualizar el subtítulo con la versión editada
            const updatedSubtitle = { ...currentSubtitle };
            return updatedSubtitle;
          }
          return sub;
        });
      });
      
      // Si hay entradas, generar automáticamente el VTT
      if (currentSubtitle.entries.length > 0) {
        generateVTT(currentSubtitle.language);
      }
      
      setCurrentSubtitle(null);
      setEditingSubtitle(false);
    }
  };
  
  // Cancelar edición de subtítulo
  const cancelEditSubtitle = () => {
    setCurrentSubtitle(null);
    setEditingSubtitle(false);
  };
  
  // Formatear tiempo
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Subir video procesado con subtítulos y audio personalizado
  const uploadVideo = () => {
    if (!videoFile) {
      setUploadError('No se ha seleccionado ningún video');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');
    
    // Crear datos de formulario
    const formData = new FormData();
    formData.append('video', videoFile);
    
    // Añadir metadatos del video
    formData.append('videoName', videoName);
    formData.append('videoDuration', videoDuration.toString());
    formData.append('videoFormat', videoFormat);
    
    // Añadir información sobre si tiene audio personalizado
    const hasCustomAudio = audioTracks.some(track => track.url);
    formData.append('hasCustomAudio', hasCustomAudio.toString());
    
    // Añadir información sobre los subtítulos activos
    formData.append('activeSubtitles', JSON.stringify(activeSubtitles));
    
    // Subir video
    axios.post(`${apiUrl}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      }
    })
    .then(response => {
      const videoId = response.data.video.id;
      setUploadSuccess(true);
      setUploadedVideoUrl(response.data.video.path);
      
      // Crear un array de promesas para todas las subidas adicionales
      const uploadPromises = [];
      
      // Subir subtítulos para cada idioma
      subtitles.forEach(subtitle => {
        if (subtitle.entries && subtitle.entries.length > 0) {
          uploadPromises.push(uploadSubtitle(videoId, subtitle));
        }
      });
      
      // Subir pistas de audio para cada idioma
      audioTracks.forEach(track => {
        if (track.file) {
          uploadPromises.push(uploadAudioTrack(videoId, track));
        }
      });
      
      // Esperar a que todas las subidas adicionales terminen
      Promise.all(uploadPromises)
        .then(() => {
          console.log('Todas las subidas completadas exitosamente');
          // Notificar al backend que todas las subidas están completas
          return axios.post(`${apiUrl}/${videoId}/finalize`, {
            hasCustomAudio,
            activeSubtitles
          });
        })
        .then(() => {
          console.log('Video procesado y finalizado correctamente');
        })
        .catch(error => {
          console.error('Error en las subidas adicionales:', error);
          setUploadError(`Error en las subidas adicionales: ${error.message}`);
        })
        .finally(() => {
          setIsUploading(false);
        });
    })
    .catch(error => {
      setIsUploading(false);
      setUploadError(`Error en la subida del video: ${error.message}`);
      console.error('Error uploading video:', error);
    });
  };
  
  // Reiniciar video
  const resetVideo = () => {
    // Limpiar URLs de blob
    subtitles.forEach(subtitle => {
      if (subtitle.vttUrl) {
        URL.revokeObjectURL(subtitle.vttUrl);
      }
    });
    
    audioTracks.forEach(track => {
      if (track.url) {
        URL.revokeObjectURL(track.url);
      }
    });
    
    // Reiniciar todo el estado
    setVideoPreview(null);
    setVideoFile(null);
    setVideoName('');
    setVideoSize(0);
    setVideoDuration(0);
    setVideoFormat('');
    
    // Reiniciar subtítulos y pistas de audio
    setSubtitles(prevSubtitles => {
      return prevSubtitles.map(subtitle => ({
        ...subtitle,
        text: '',
        entries: [],
        vttUrl: undefined
      }));
    });
    
    setAudioTracks(prevTracks => {
      return prevTracks.map(track => ({
        ...track,
        file: null,
        url: undefined,
        mimeType: undefined
      }));
    });
  };
  
  // Subir subtítulo
  const uploadSubtitle = (videoId, subtitle) => {
    // Crear archivo VTT si aún no se ha creado
    if (!subtitle.vttUrl && subtitle.entries.length > 0) {
      generateVTT(subtitle.language);
    }
    
    // Preparar datos de subtítulos para subir
    const subtitleData = {
      language: subtitle.language,
      entries: subtitle.entries,
      color: subtitle.color,
      backgroundColor: subtitle.backgroundColor,
      fontSize: subtitle.fontSize,
      fontFamily: subtitle.fontFamily
    };
    
    // Enviar subtítulos al servidor
    axios.post(`${apiUrl}/${videoId}/subtitles`, subtitleData)
      .then(response => {
        console.log(`Subtítulos en ${subtitle.language} subidos correctamente:`, response.data);
      })
      .catch(error => {
        console.error(`Error al subir subtítulos en ${subtitle.language}:`, error);
      });
  };
  
  // Subir pista de audio
  const uploadAudioTrack = (videoId, track) => {
    if (!track.file) return;
    
    const formData = new FormData();
    formData.append('audio', track.file);
    formData.append('language', track.language);
    
    axios.post(`${apiUrl}/${videoId}/audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        console.log(`Pista de audio en ${track.language} subida correctamente:`, response.data);
      })
      .catch(error => {
        console.error(`Error al subir pista de audio en ${track.language}:`, error);
      });
  };
  
  // Actualizar entrada de subtítulo
  const updateSubtitleEntry = (index, field, value) => {
    if (currentSubtitle) {
      setCurrentSubtitle(prev => {
        const updatedEntries = [...prev.entries];
        updatedEntries[index] = {
          ...updatedEntries[index],
          [field]: value
        };
        return {
          ...prev,
          entries: updatedEntries
        };
      });
    }
  };
  
  // Actualizar estilo de subtítulo
  const updateSubtitleStyle = (field, value) => {
    if (currentSubtitle) {
      setCurrentSubtitle(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <div className="video-upload-container">
      <TangramLoader isLoading={isUploading} onSkip={() => setIsUploading(false)} />
      {!videoPreview ? (
        <div className="upload-section">
          <h2>Subir Video</h2>
          <div className="upload-box">
            <input 
              type="file" 
              onChange={handleFileSelected} 
              accept="video/*" 
              id="videoInput" 
              className="file-input" 
            />
            <label htmlFor="videoInput" className="file-label">
              <span>Elegir un video</span>
            </label>
          </div>
        </div>
      ) : (
        <div className="preview-section">
          <h2>Vista Previa del Video</h2>
          <div className="video-preview">
            {/* Video con audio original (se oculta cuando hay audio personalizado) */}
            {!audioTracks.some(track => track.url) && (
              <video 
                ref={videoRef} 
                src={videoPreview} 
                controls
                className="main-video"
              >
                {subtitles.map(subtitle => 
                  subtitle.vttUrl && (
                    <track 
                      key={subtitle.id}
                      src={subtitle.vttUrl} 
                      label={subtitle.language === 'en' ? 'English' : 'Español'} 
                      srcLang={subtitle.language} 
                      default={subtitle.language === 'en'}
                      kind="subtitles"
                    />
                  )
                )}
              </video>
            )}
            
            {/* Video con audio personalizado */}
            {audioTracks.some(track => track.url) && (
              <div className="video-with-custom-audio">
                <video 
                  ref={videoRef} 
                  src={videoPreview} 
                  controls
                  className="main-video"
                  muted={true} // Silenciar el video original
                  onPlay={() => {
                    // Sincronizar reproducción de audio cuando se inicia el video
                    const activeAudio = document.querySelector('.custom-audio-track');
                    if (activeAudio) {
                      activeAudio.currentTime = videoRef.current.currentTime;
                      activeAudio.play();
                    }
                  }}
                  onPause={() => {
                    // Pausar audio cuando se pausa el video
                    const activeAudio = document.querySelector('.custom-audio-track');
                    if (activeAudio) {
                      activeAudio.pause();
                    }
                  }}
                  onSeeked={() => {
                    // Sincronizar posición del audio cuando se busca en el video
                    const activeAudio = document.querySelector('.custom-audio-track');
                    if (activeAudio) {
                      activeAudio.currentTime = videoRef.current.currentTime;
                    }
                  }}
                >
                  {subtitles.map(subtitle => 
                    subtitle.vttUrl && (
                      <track 
                        key={subtitle.id}
                        src={subtitle.vttUrl} 
                        label={subtitle.language === 'en' ? 'English' : 'Español'} 
                        srcLang={subtitle.language} 
                        default={activeSubtitles[subtitle.language]}
                        kind="subtitles"
                      />
                    )
                  )}
                </video>
                
                {/* Audio personalizado (oculto pero sincronizado con el video) */}
                {audioTracks.map(track => 
                  track.url && (
                    <audio 
                      key={track.id}
                      src={track.url} 
                      className="custom-audio-track"
                      style={{ display: 'none' }}
                    />
                  )
                )}
                
                <div className="custom-audio-info">
                  <span className="audio-badge">Audio personalizado activo</span>
                  {audioTracks.filter(track => track.url).map(track => (
                    <div key={track.id} className="audio-track-info">
                      <span>{track.language === 'en' ? 'Audio en inglés' : 'Audio en español'}</span>
                      <span className="audio-filename">{track.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Controles de subtítulos */}
            {subtitles.some(subtitle => subtitle.vttUrl) && (
              <div className="subtitle-controls">
                <h4>Controles de Subtítulos</h4>
                <div className="subtitle-toggle-buttons">
                  {subtitles.map(subtitle => 
                    subtitle.vttUrl && (
                      <button 
                        key={`toggle-${subtitle.id}`}
                        className={`btn ${activeSubtitles[subtitle.language] ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => toggleSubtitles(subtitle.language)}
                      >
                        {subtitle.language === 'en' ? 'Subtítulos en Inglés' : 'Subtítulos en Español'}: 
                        {activeSubtitles[subtitle.language] ? 'ON' : 'OFF'}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="video-metadata">
            <h3>Detalles del Video</h3>
            <ul>
              <li><strong>Nombre:</strong> {videoName}</li>
              <li><strong>Tamaño:</strong> {formatFileSize(videoSize)}</li>
              <li><strong>Formato:</strong> {videoFormat}</li>
              <li><strong>Duración:</strong> {formatTime(videoDuration)}</li>
            </ul>
          </div>
          
          {/* Sección de Subtítulos */}
          <div className="subtitles-section">
            <h3>Subtítulos</h3>
            
            {subtitles.map(subtitle => (
              <div key={subtitle.id} className="subtitle-language">
                <h4>{subtitle.language === 'en' ? 'Subtítulos en Inglés' : 'Subtítulos en Español'}</h4>
                
                <div className="subtitle-status">
                  <span className={`status-badge ${subtitle.vttUrl ? 'active' : ''}`}>
                    {subtitle.vttUrl ? 'Subtítulos Activos' : 'Sin Subtítulos'}
                  </span>
                  {subtitle.vttUrl && (
                    <span className={`subtitle-toggle ${activeSubtitles[subtitle.language] ? 'on' : 'off'}`}>
                      {activeSubtitles[subtitle.language] ? 'Visibles' : 'Ocultos'}
                    </span>
                  )}
                </div>
                
                <div className="subtitle-actions">
                  <button 
                    onClick={() => generateAutomaticSubtitles(subtitle.language)} 
                    className="btn btn-primary"
                    disabled={!videoPreview}
                  >
                    Generar Subtítulos Automáticos
                  </button>
                  
                  {subtitle.entries && subtitle.entries.length > 0 && (
                    <button 
                      onClick={() => generateSubtitles(subtitle.language)} 
                      className="btn btn-success"
                    >
                      Aplicar al Video
                    </button>
                  )}
                  
                  {subtitle.vttUrl && (
                    <>
                      <button 
                        onClick={() => toggleSubtitles(subtitle.language)} 
                        className={`btn ${activeSubtitles[subtitle.language] ? 'btn-warning' : 'btn-info'}`}
                      >
                        {activeSubtitles[subtitle.language] ? 'Ocultar' : 'Mostrar'}
                      </button>
                      
                      <button 
                        onClick={() => previewSubtitles(subtitle.language)} 
                        className="btn btn-info"
                      >
                        Vista Previa
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Sección de Pistas de Audio */}
          <div className="audio-tracks-section">
            <h3>Pistas de Audio</h3>
            
            {audioTracks.map(track => (
              <div key={track.id} className="audio-track">
                <h4>{track.language === 'en' ? 'Audio en Inglés' : 'Audio en Español'}</h4>
                <div className="audio-upload">
                  <input 
                    type="file" 
                    onChange={(e) => handleAudioSelected(e, track.language)} 
                    accept="audio/*" 
                    id={`audioInput-${track.language}`} 
                    className="file-input" 
                  />
                  <label 
                    htmlFor={`audioInput-${track.language}`} 
                    className="file-label"
                  >
                    <span>{track.file ? track.file.name : 'Seleccionar archivo de audio'}</span>
                  </label>
                </div>
                <div className="audio-status">
                  <span className={`status-badge ${track.url ? 'active' : ''}`}>
                    {track.url ? 'Audio Activo' : 'Sin Audio'}
                  </span>
                </div>
                {track.file && (
                  <div className="audio-preview">
                    {track.url ? (
                      <audio controls src={track.url}></audio>
                    ) : (
                      <button 
                        onClick={() => processAudioTrack(track.language)} 
                        className="btn btn-success"
                      >
                        Procesar Audio
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Modal de Editor de Subtítulos */}
          {editingSubtitle && currentSubtitle && (
            <div className="subtitle-editor-modal">
              <div className="modal-content">
                <h3>
                  Editar Subtítulos en {currentSubtitle.language === 'en' ? 'Inglés' : 'Español'}
                </h3>
                
                <div className="form-group">
                  <label htmlFor="subtitleText">Texto</label>
                  <textarea 
                    id="subtitleText" 
                    value={currentSubtitle.text} 
                    onChange={(e) => updateSubtitleStyle('text', e.target.value)} 
                    rows="4" 
                    placeholder="Ingrese el texto del subtítulo"
                  ></textarea>
                </div>
                
                <div className="subtitle-entries">
                  <h4>Entradas de Subtítulos</h4>
                  <button 
                    onClick={addSubtitleEntry} 
                    className="btn btn-sm btn-primary"
                  >
                    Añadir Entrada
                  </button>
                  
                  <div className="subtitle-entries-list">
                    {currentSubtitle.entries.map((entry, index) => (
                      <div key={index} className="subtitle-entry">
                        <div className="entry-header">
                          <span>Entrada #{index + 1}</span>
                          <button 
                            onClick={() => removeSubtitleEntry(index)} 
                            className="btn btn-sm btn-danger"
                          >
                            Eliminar
                          </button>
                        </div>
                        <div className="entry-times">
                          <div className="form-group">
                            <label>Tiempo Inicial (segundos)</label>
                            <input 
                              type="number" 
                              value={entry.startTime} 
                              onChange={(e) => updateSubtitleEntry(index, 'startTime', parseFloat(e.target.value))} 
                              min="0" 
                              max={videoDuration} 
                              step="0.1" 
                            />
                          </div>
                          <div className="form-group">
                            <label>Tiempo Final (segundos)</label>
                            <input 
                              type="number" 
                              value={entry.endTime} 
                              onChange={(e) => updateSubtitleEntry(index, 'endTime', parseFloat(e.target.value))} 
                              min={entry.startTime} 
                              max={videoDuration} 
                              step="0.1" 
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Texto</label>
                          <textarea 
                            value={entry.text} 
                            onChange={(e) => updateSubtitleEntry(index, 'text', e.target.value)} 
                            rows="2"
                          ></textarea>
                        </div>
                      </div>
                    ))}
                    
                    {currentSubtitle.entries.length === 0 && (
                      <div className="no-entries">
                        No hay entradas de subtítulos. Haga clic en "Añadir Entrada" para crear una.
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="subtitle-styles">
                  <h4>Estilos de Subtítulos</h4>
                  
                  <div className="style-options">
                    <div className="form-group">
                      <label htmlFor="textColor">Color de Texto</label>
                      <input 
                        type="color" 
                        id="textColor" 
                        value={currentSubtitle.color} 
                        onChange={(e) => updateSubtitleStyle('color', e.target.value)} 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="bgColor">Color de Fondo</label>
                      <input 
                        type="color" 
                        id="bgColor" 
                        value={currentSubtitle.backgroundColor} 
                        onChange={(e) => updateSubtitleStyle('backgroundColor', e.target.value)} 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="fontSize">Tamaño de Fuente</label>
                      <select 
                        id="fontSize" 
                        value={currentSubtitle.fontSize} 
                        onChange={(e) => updateSubtitleStyle('fontSize', e.target.value)}
                      >
                        {fontSizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="fontFamily">Tipografía</label>
                      <select 
                        id="fontFamily" 
                        value={currentSubtitle.fontFamily} 
                        onChange={(e) => updateSubtitleStyle('fontFamily', e.target.value)}
                      >
                        {fontFamilies.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div 
                    className="subtitle-preview" 
                    style={{
                      color: currentSubtitle.color,
                      backgroundColor: currentSubtitle.backgroundColor,
                      fontSize: currentSubtitle.fontSize,
                      fontFamily: currentSubtitle.fontFamily
                    }}
                  >
                    {currentSubtitle.text || 'Texto de ejemplo para subtítulos'}
                  </div>
                </div>
                
                <div className="action-buttons">
                  <button onClick={saveSubtitle} className="btn btn-success">Guardar</button>
                  <button onClick={cancelEditSubtitle} className="btn btn-danger">Cancelar</button>
                </div>
              </div>
            </div>
          )}
          
          {/* Estado de la Subida */}
          {(isUploading || uploadSuccess || uploadError) && (
            <div className="upload-status">
              {isUploading && (
                <div className="progress-container">
                  <h4>Subiendo Video...</h4>
                  <div className="progress">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${uploadProgress}%` }}
                    >
                      {uploadProgress}%
                    </div>
                  </div>
                </div>
              )}
              
              {uploadSuccess && (
                <div className="success-message">
                  <h4>¡Subida Exitosa!</h4>
                  <p>Tu video ha sido subido exitosamente.</p>
                  {uploadedVideoUrl && (
                    <p>URL del Video: {uploadedVideoUrl}</p>
                  )}
                </div>
              )}
              
              {uploadError && (
                <div className="error-message">
                  <h4>Error en la Subida</h4>
                  <p>{uploadError}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="action-buttons">
            <button 
              onClick={uploadVideo} 
              className="btn btn-success" 
              disabled={isUploading}
            >
              Subir Video
            </button>
            <button 
              onClick={resetVideo} 
              className="btn btn-danger" 
              disabled={isUploading}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
