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
      id: 1, 
      language: 'es', 
      entries: [], 
      vttUrl: null, 
      fileName: null,
      color: '#ffffff',
      backgroundColor: '#000000',
      fontSize: '18px',
      fontFile: null,
      fontUrl: null
    },
    { 
      id: 2, 
      language: 'en', 
      entries: [], 
      vttUrl: null, 
      fileName: null,
      color: '#ffffff',
      backgroundColor: '#000000',
      fontSize: '18px',
      fontFile: null,
      fontUrl: null
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
  
  // Control de audio activo
  const [activeAudioTrack, setActiveAudioTrack] = useState('original'); // 'original', 'en', 'es'
  
  // Función para cambiar pista de audio y asegurar sincronización
  const switchAudioTrack = (trackType) => {
    // Pausar todos los audios primero
    audioTracks.forEach(track => {
      if (track.url) {
        const audio = document.querySelector(`.audio-track-${track.language}`);
        if (audio) {
          audio.pause();
        }
      }
    });
    
    // Cambiar el estado
    setActiveAudioTrack(trackType);
    
    // Si el video está reproduciéndose, sincronizar el nuevo audio
    if (videoRef.current && !videoRef.current.paused) {
      setTimeout(() => {
        if (trackType !== 'original') {
          const activeAudio = document.querySelector(`.audio-track-${trackType}`);
          if (activeAudio) {
            activeAudio.currentTime = videoRef.current.currentTime;
            activeAudio.play();
          }
        }
      }, 100);
    }
  };
  
  // Opciones de fuente
  const fontFamilies = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia'];
  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
  
  // URL de la API
  const apiUrl = 'http://localhost:3000/videos';
  
  // User ID (should be passed as prop or from context/auth)
  const userId = 1; // Default for testing - should be dynamic
  
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

  // Validar tamaños de archivo antes de subir
  const validateFileSizes = () => {
    const maxVideoSize = 100 * 1024 * 1024; // 100MB
    const maxAudioSize = 50 * 1024 * 1024;  // 50MB

    // Validar video
    if (videoFile && videoFile.size > maxVideoSize) {
      return `El video es demasiado grande (${formatFileSize(videoFile.size)}). Máximo permitido: ${formatFileSize(maxVideoSize)}`;
    }

    // Validar archivos de audio
    for (const track of audioTracks) {
      if (track.file && track.file.size > maxAudioSize) {
        return `El archivo de audio en ${track.language} es demasiado grande (${formatFileSize(track.file.size)}). Máximo permitido: ${formatFileSize(maxAudioSize)}`;
      }
    }

    return null;
  };

  // Validar que todos los archivos necesarios estén presentes
  const validateCompleteness = () => {
    const errors = [];

    // Verificar video
    if (!videoFile) {
      errors.push('Video requerido');
    }

    // Verificar subtítulos (al menos uno debe tener entradas)
    const hasSubtitles = subtitles.some(subtitle => subtitle.entries && subtitle.entries.length > 0);
    if (!hasSubtitles) {
      errors.push('Al menos un idioma debe tener subtítulos');
    }

    // Verificar archivos de audio (al menos uno debe estar presente)
    const hasAudio = audioTracks.some(track => track.file);
    if (!hasAudio) {
      errors.push('Al menos un archivo de audio es requerido');
    }

    return errors;
  };

  // Subir video procesado con subtítulos y audio personalizado
  const uploadVideo = () => {
    // Validar completeness primero
    const completenessErrors = validateCompleteness();
    if (completenessErrors.length > 0) {
      setUploadError(`Faltan elementos requeridos: ${completenessErrors.join(', ')}`);
      return;
    }

    // Validar tamaños de archivo
    const sizeError = validateFileSizes();
    if (sizeError) {
      setUploadError(sizeError);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');

    // Crear datos de formulario
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('userId', userId.toString());
    formData.append('duration', videoDuration.toString());

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
        setUploadedVideoUrl(response.data.video.video_url || response.data.video.path);

        console.log('Video subido exitosamente, ID:', videoId);

        // Crear un array de promesas para todas las subidas adicionales
        const uploadPromises = [];

        // Subir subtítulos para cada idioma
        subtitles.forEach(subtitle => {
          console.log(`Procesando subtítulos para ${subtitle.language}:`, subtitle);
          if (subtitle.entries && subtitle.entries.length > 0) {
            uploadPromises.push(uploadSubtitle(videoId, subtitle));
          } else {
            console.log(`No hay entradas de subtítulos para ${subtitle.language}`);
          }
        });

        // Subir pistas de audio para cada idioma
        audioTracks.forEach(track => {
          console.log(`Procesando audio para ${track.language}:`, track.file ? track.file.name : 'Sin archivo');
          if (track.file) {
            uploadPromises.push(uploadAudioTrack(videoId, track));
          } else {
            console.log(`No hay archivo de audio para ${track.language}`);
          }
        });

        console.log(`Iniciando ${uploadPromises.length} subidas adicionales`);

        // Esperar a que todas las subidas adicionales terminen
        return Promise.allSettled(uploadPromises)
          .then(results => {
            const successful = results.filter(result => result.status === 'fulfilled');
            const failed = results.filter(result => result.status === 'rejected');

            console.log(`Subidas completadas: ${successful.length} exitosas, ${failed.length} fallidas`);

            if (failed.length > 0) {
              failed.forEach((result, index) => {
                console.error(`Subida ${index + 1} falló:`, result.reason);
              });
              
              // Si hay fallos, eliminar el video subido para evitar datos incompletos
              console.log('Eliminando video debido a fallos en subidas adicionales...');
              axios.delete(`${apiUrl}/${videoId}`)
                .then(() => {
                  console.log('Video eliminado exitosamente debido a fallos');
                })
                .catch(deleteError => {
                  console.error('Error al eliminar video:', deleteError);
                });
              
              setUploadError(`Subida cancelada. Fallos detectados: ${failed.length} de ${results.length}. El video no se guardó.`);
              setUploadSuccess(false);
            } else {
              console.log('Todas las subidas completadas exitosamente');
            }
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

  // Subir pista de audio
  const uploadAudioTrack = (videoId, track) => {
    if (!track.file) {
      console.log(`No hay archivo de audio para ${track.language}`);
      return Promise.resolve();
    }

    // Validar tamaño antes de subir
    const maxAudioSize = 50 * 1024 * 1024; // 50MB
    if (track.file.size > maxAudioSize) {
      const error = new Error(`Archivo de audio demasiado grande: ${formatFileSize(track.file.size)}. Máximo: ${formatFileSize(maxAudioSize)}`);
      console.error(`Error de tamaño para audio ${track.language}:`, error.message);
      return Promise.reject(error);
    }

    const formData = new FormData();
    formData.append('audio', track.file);
    formData.append('language', track.language);

    console.log(`Enviando audio para ${track.language}:`, track.file.name, `(${formatFileSize(track.file.size)})`);

    return axios.post(`${apiUrl}/${videoId}/audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        console.log(`Pista de audio en ${track.language} subida correctamente:`, response.data);
        return response.data;
      })
      .catch(error => {
        console.error(`Error al subir pista de audio en ${track.language}:`, error);
        if (error.response) {
          console.error('Respuesta del servidor:', error.response.data);
          console.error('Status:', error.response.status);
        }
        throw error;
      });
  };
  
  // Subir subtítulos al servidor
  const uploadSubtitle = async (videoId, subtitle) => {
    try {
      const response = await axios.post(`${apiUrl}/${videoId}/subtitles`, {
        language: subtitle.language,
        entries: subtitle.entries,
        textColor: subtitle.color,
        backgroundColor: subtitle.backgroundColor,
        fontSize: subtitle.fontSize,
        fontFamily: subtitle.fontFamily || subtitle.fontFile
      });
      
      console.log(`Subtítulos para ${subtitle.language} subidos correctamente:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error al subir subtítulos para ${subtitle.language}:`, error);
      throw error;
    }
  };
  
  // Resetear video y limpiar estado
  const resetVideo = () => {
    // Limpiar archivo de video
    setVideoFile(null);
    setVideoPreview(null);
    setIsPlaying(false);
    
    // Limpiar metadatos
    setVideoName('');
    setVideoSize(0);
    setVideoDuration(0);
    setVideoFormat('');
    
    // Limpiar estado de subida
    setUploadProgress(0);
    setUploadSuccess(false);
    setUploadError('');
    setIsUploading(false);
    setUploadedVideoUrl('');
    
    // Resetear subtítulos
    setSubtitles([
      { 
        id: 1, 
        language: 'es', 
        entries: [], 
        vttUrl: null, 
        fileName: null,
        color: '#ffffff',
        backgroundColor: '#000000',
        fontSize: '18px',
        fontFile: null,
        fontUrl: null
      },
      { 
        id: 2, 
        language: 'en', 
        entries: [], 
        vttUrl: null, 
        fileName: null,
        color: '#ffffff',
        backgroundColor: '#000000',
        fontSize: '18px',
        fontFile: null,
        fontUrl: null
      }
    ]);
    
    // Resetear pistas de audio
    setAudioTracks([
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
    
    // Limpiar edición de subtítulos
    setCurrentSubtitle(null);
    setEditingSubtitle(false);
    
    // Resetear audio activo
    setActiveAudioTrack('original');
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

  // Editar subtítulo
  const editSubtitle = (language) => {
    const subtitle = subtitles.find(sub => sub.language === language);
    if (subtitle) {
      // Crear una copia profunda para evitar modificar el original hasta guardar
      setCurrentSubtitle({
        ...subtitle,
        entries: subtitle.entries.map(entry => ({ ...entry }))
      });
      setEditingSubtitle(true);
    }
  };

  // Añadir entrada de subtítulo
  const addSubtitleEntry = () => {
    if (currentSubtitle) {
      setCurrentSubtitle(prev => ({
        ...prev,
        entries: [
          ...prev.entries,
          {
            startTime: 0,
            endTime: videoDuration > 5 ? 5 : videoDuration,
            text: ''
          }
        ]
      }));
    }
  };

  // Eliminar entrada de subtítulo
  const removeSubtitleEntry = (index) => {
    if (currentSubtitle && currentSubtitle.entries.length > index) {
      setCurrentSubtitle(prev => ({
        ...prev,
        entries: prev.entries.filter((_, i) => i !== index)
      }));
    }
  };

  // Generar archivo VTT
  const generateVTT = (language) => {
    const subtitle = subtitles.find(sub => sub.language === language);
    
    if (subtitle && subtitle.entries.length > 0) {
      // Limpiar URL anterior si existe
      if (subtitle.vttUrl) {
        URL.revokeObjectURL(subtitle.vttUrl);
      }
      
      // Generar contenido VTT
      let vttContent = 'WEBVTT\n\n';
      
      subtitle.entries.forEach((entry, index) => {
        const startTime = formatTimeForVTT(entry.startTime);
        const endTime = formatTimeForVTT(entry.endTime);
        
        vttContent += `${index + 1}\n`;
        vttContent += `${startTime} --> ${endTime}\n`;
        vttContent += `${entry.text}\n\n`;
      });
      
      // Crear blob URL
      const blob = new Blob([vttContent], { type: 'text/vtt' });
      const vttUrl = URL.createObjectURL(blob);
      
      // Actualizar estado
      setSubtitles(prevSubtitles => {
        return prevSubtitles.map(sub => {
          if (sub.language === language) {
            return {
              ...sub,
              vttUrl: vttUrl
            };
          }
          return sub;
        });
      });
    }
  };

  // Formatear tiempo para VTT (HH:MM:SS.mmm)
  const formatTimeForVTT = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  // Actualizar estilos de subtítulos en el servidor
  const updateSubtitleStyling = async (videoId, textColor, backgroundColor) => {
    try {
      const response = await axios.put(`${apiUrl}/${videoId}/subtitle-styling`, {
        textColor,
        backgroundColor
      });
      console.log('Estilos de subtítulos actualizados:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error actualizando estilos de subtítulos:', error);
      throw error;
    }
  };

  // Manejar selección de archivo VTT
  const handleVTTFileSelected = (event, language) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validar que sea un archivo VTT
    if (!file.name.toLowerCase().endsWith('.vtt')) {
      alert('Por favor selecciona un archivo VTT válido');
      return;
    }
    
    // Leer el contenido del archivo VTT
    const reader = new FileReader();
    reader.onload = (e) => {
      const vttContent = e.target.result;
      
      try {
        // Parsear el contenido VTT y extraer las entradas
        const entries = parseVTTContent(vttContent);
        
        // Crear URL del blob para el archivo VTT
        const blob = new Blob([vttContent], { type: 'text/vtt' });
        const vttUrl = URL.createObjectURL(blob);
        
        // Actualizar el estado de subtítulos
        setSubtitles(prevSubtitles => {
          return prevSubtitles.map(subtitle => {
            if (subtitle.language === language) {
              // Limpiar URL anterior si existe
              if (subtitle.vttUrl) {
                URL.revokeObjectURL(subtitle.vttUrl);
              }
              
              return {
                ...subtitle,
                entries: entries,
                vttUrl: vttUrl,
                fileName: file.name
              };
            }
            return subtitle;
          });
        });
        
        console.log(`Archivo VTT cargado para ${language}:`, file.name);
        console.log(`Entradas extraídas:`, entries);
        
      } catch (error) {
        console.error('Error al parsear el archivo VTT:', error);
        alert('Error al procesar el archivo VTT. Verifica que el formato sea correcto.');
      }
    };
    
    reader.onerror = () => {
      console.error('Error al leer el archivo VTT');
      alert('Error al leer el archivo VTT');
    };
    
    reader.readAsText(file);
    
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    event.target.value = '';
  };

  // Parsear contenido VTT y extraer entradas
  const parseVTTContent = (vttContent) => {
    const lines = vttContent.split('\n');
    const entries = [];
    let currentEntry = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Saltar líneas vacías y la cabecera WEBVTT
      if (!line || line === 'WEBVTT') continue;
      
      // Detectar línea de tiempo (formato: 00:00:00.000 --> 00:00:00.000)
      if (line.includes('-->')) {
        const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/);
        
        if (timeMatch) {
          // Guardar entrada anterior si existe
          if (currentEntry && currentEntry.text.trim()) {
            entries.push(currentEntry);
          }
          
          // Crear nueva entrada
          currentEntry = {
            startTime: parseVTTTime(timeMatch[1]),
            endTime: parseVTTTime(timeMatch[2]),
            text: ''
          };
        }
      }
      // Si tenemos una entrada actual y la línea no es un número (índice), es texto
      else if (currentEntry && line && !/^\d+$/.test(line)) {
        if (currentEntry.text) {
          currentEntry.text += '\n' + line;
        } else {
          currentEntry.text = line;
        }
      }
    }
    
    // Agregar la última entrada si existe
    if (currentEntry && currentEntry.text.trim()) {
      entries.push(currentEntry);
    }
    
    return entries;
  };

  // Convertir tiempo VTT (HH:MM:SS.mmm) a segundos
  const parseVTTTime = (timeString) => {
    const parts = timeString.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const secondsParts = parts[2].split('.');
    const seconds = parseInt(secondsParts[0], 10);
    const milliseconds = parseInt(secondsParts[1], 10);
    
    return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
  };

  // Eliminar subtítulos
  const removeSubtitles = (language) => {
    setSubtitles(prevSubtitles => {
      return prevSubtitles.map(subtitle => {
        if (subtitle.language === language) {
          // Limpiar URL del blob si existe
          if (subtitle.vttUrl) {
            URL.revokeObjectURL(subtitle.vttUrl);
          }
          
          return {
            ...subtitle,
            entries: [],
            vttUrl: null,
            fileName: null
          };
        }
        return subtitle;
      });
    });
    
    // Desactivar subtítulos si estaban activos
    setActiveSubtitles(prev => ({
      ...prev,
      [language]: false
    }));
    
    console.log(`Subtítulos eliminados para ${language}`);
  };

  // Función para actualizar colores de todos los subtítulos
  const updateAllSubtitleColors = (colorType, value) => {
    setSubtitles(prevSubtitles => {
      const updatedSubtitles = prevSubtitles.map(subtitle => ({ ...subtitle, [colorType]: value }));
      
      // Aplicar estilos CSS inmediatamente después de actualizar el estado
      setTimeout(() => {
        const textColor = colorType === 'color' ? value : updatedSubtitles[0]?.color || '#ffffff';
        const bgColor = colorType === 'backgroundColor' ? value : updatedSubtitles[0]?.backgroundColor || '#000000';
        const fontSize = updatedSubtitles[0]?.fontSize || '18px';
        const fontUrl = updatedSubtitles[0]?.fontUrl;
        applySubtitleStylesToVideo(textColor, bgColor, fontSize, fontUrl);
      }, 0);
      
      return updatedSubtitles;
    });
  };

  // Función para actualizar tamaño de fuente de todos los subtítulos
  const updateAllSubtitleFontSize = (fontSize) => {
    setSubtitles(prevSubtitles => {
      const updatedSubtitles = prevSubtitles.map(subtitle => ({ ...subtitle, fontSize }));
      
      // Aplicar estilos CSS inmediatamente
      setTimeout(() => {
        const textColor = updatedSubtitles[0]?.color || '#ffffff';
        const bgColor = updatedSubtitles[0]?.backgroundColor || '#000000';
        const fontUrl = updatedSubtitles[0]?.fontUrl;
        applySubtitleStylesToVideo(textColor, bgColor, fontSize, fontUrl);
      }, 0);
      
      return updatedSubtitles;
    });
  };

  // Función para manejar subida de archivo de fuente TTF
  const handleFontFileSelected = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validar que sea un archivo TTF
    if (!file.name.toLowerCase().endsWith('.ttf')) {
      alert('Por favor selecciona un archivo TTF válido');
      return;
    }
    
    try {
      // Crear URL del blob para la fuente
      const fontUrl = URL.createObjectURL(file);
      
      // Crear elemento de estilo para cargar la fuente
      const fontFace = new FontFace('CustomSubtitleFont', `url(${fontUrl})`);
      await fontFace.load();
      document.fonts.add(fontFace);
      
      // Actualizar estado de subtítulos
      setSubtitles(prevSubtitles => {
        const updatedSubtitles = prevSubtitles.map(subtitle => ({ 
          ...subtitle, 
          fontFile: file.name,
          fontUrl: fontUrl
        }));
        
        // Aplicar estilos CSS inmediatamente
        setTimeout(() => {
          const textColor = updatedSubtitles[0]?.color || '#ffffff';
          const bgColor = updatedSubtitles[0]?.backgroundColor || '#000000';
          const fontSize = updatedSubtitles[0]?.fontSize || '18px';
          applySubtitleStylesToVideo(textColor, bgColor, fontSize, fontUrl);
        }, 0);
        
        return updatedSubtitles;
      });
      
      console.log(`Fuente TTF cargada: ${file.name}`);
      
    } catch (error) {
      console.error('Error al cargar la fuente:', error);
      alert('Error al cargar el archivo de fuente. Verifica que sea un archivo TTF válido.');
    }
    
    // Limpiar el input
    event.target.value = '';
  };

  // Función para aplicar estilos CSS directamente a los subtítulos del video
  const applySubtitleStylesToVideo = (textColor, backgroundColor, fontSize = '18px', fontUrl = null) => {
    // Crear o actualizar estilos CSS para los subtítulos
    let styleElement = document.getElementById('subtitle-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'subtitle-styles';
      document.head.appendChild(styleElement);
    }
    
    const fontFamily = fontUrl ? 'CustomSubtitleFont' : 'Arial';
    
    styleElement.textContent = `
      video::cue {
        color: ${textColor} !important;
        background: ${backgroundColor} !important;
        font-size: ${fontSize} !important;
        font-family: ${fontFamily} !important;
        font-weight: bold !important;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.8) !important;
        padding: 2px 6px !important;
        border-radius: 3px !important;
        box-decoration-break: clone !important;
        -webkit-box-decoration-break: clone !important;
      }
      
      video::-webkit-media-text-track-display {
        background: transparent !important;
      }
      
      video::-webkit-media-text-track-container {
        background: transparent !important;
      }
      
      .main-video::cue {
        color: ${textColor} !important;
        background: ${backgroundColor} !important;
        font-size: ${fontSize} !important;
        font-family: ${fontFamily} !important;
        font-weight: bold !important;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.8) !important;
        padding: 2px 6px !important;
        border-radius: 3px !important;
        box-decoration-break: clone !important;
        -webkit-box-decoration-break: clone !important;
      }
      
      .main-video::-webkit-media-text-track-display {
        background: transparent !important;
      }
      
      .main-video::-webkit-media-text-track-container {
        background: transparent !important;
      }
    `;
    
    // Forzar actualización de las pistas de subtítulos
    if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (track.mode === 'showing') {
          // Forzar re-renderizado desactivando y reactivando
          track.mode = 'hidden';
          setTimeout(() => {
            track.mode = 'showing';
          }, 10);
        }
      }
    }
  };

  // Actualizar colores de subtítulos (función simplificada, ya no se usa)
  const updateSubtitleColor = (language, colorType, value) => {
    setSubtitles(prevSubtitles => {
      return prevSubtitles.map(subtitle => {
        if (subtitle.language === language) {
          return {
            ...subtitle,
            [colorType]: value
          };
        }
        return subtitle;
      });
    });
    
    console.log(`Color ${colorType} actualizado para ${language}: ${value}`);
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
            {/* Video principal */}
            <video 
              ref={videoRef} 
              src={videoPreview} 
              controls
              className="main-video"
              muted={activeAudioTrack !== 'original'}
              onPlay={() => {
                // Pausar todos los audios primero
                audioTracks.forEach(track => {
                  if (track.url) {
                    const audio = document.querySelector(`.audio-track-${track.language}`);
                    if (audio) {
                      audio.pause();
                    }
                  }
                });
                
                // Sincronizar reproducción de audio cuando se inicia el video
                if (activeAudioTrack !== 'original') {
                  const activeAudio = document.querySelector(`.audio-track-${activeAudioTrack}`);
                  if (activeAudio) {
                    activeAudio.currentTime = videoRef.current.currentTime;
                    activeAudio.play();
                  }
                }
              }}
              onPause={() => {
                // Pausar todos los audios
                audioTracks.forEach(track => {
                  if (track.url) {
                    const audio = document.querySelector(`.audio-track-${track.language}`);
                    if (audio) {
                      audio.pause();
                    }
                  }
                });
              }}
              onSeeked={() => {
                // Sincronizar posición del audio cuando se busca en el video
                if (activeAudioTrack !== 'original') {
                  const activeAudio = document.querySelector(`.audio-track-${activeAudioTrack}`);
                  if (activeAudio) {
                    activeAudio.currentTime = videoRef.current.currentTime;
                  }
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
            
            {/* Audios personalizados (ocultos pero sincronizados con el video) */}
            {audioTracks.map(track => 
              track.url && (
                <audio 
                  key={track.id}
                  src={track.url} 
                  className={`audio-track-${track.language}`}
                  style={{ display: 'none' }}
                />
              )
            )}
            
            {/* Controles de selección de audio */}
            <div className="audio-controls">
              <h4>Seleccionar Audio</h4>
              <div className="audio-selector">
                <button 
                  className={`btn ${activeAudioTrack === 'original' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => switchAudioTrack('original')}
                >
                  Audio Original
                </button>
                
                {audioTracks.map(track => 
                  track.url && (
                    <button 
                      key={`selector-${track.id}`}
                      className={`btn ${activeAudioTrack === track.language ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => switchAudioTrack(track.language)}
                    >
                      {track.language === 'en' ? 'Audio en Inglés' : 'Audio en Español'}
                    </button>
                  )
                )}
              </div>
              
              {activeAudioTrack !== 'original' && (
                <div className="active-audio-info">
                  <span className="audio-badge">
                    Reproduciendo: {activeAudioTrack === 'en' ? 'Audio en Inglés' : 'Audio en Español'}
                  </span>
                </div>
              )}
            </div>
            
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
                  {subtitle.fileName && (
                    <span className="file-info">
                      📄 {subtitle.fileName}
                    </span>
                  )}
                  {subtitle.entries && subtitle.entries.length > 0 && (
                    <span className="entries-count">
                      {subtitle.entries.length} entradas
                    </span>
                  )}
                </div>
                
                <div className="subtitle-actions">
                  {/* Subir archivo VTT */}
                  <div className="vtt-upload-section">
                    <input 
                      type="file" 
                      id={`vtt-input-${subtitle.language}`}
                      accept=".vtt"
                      onChange={(e) => handleVTTFileSelected(e, subtitle.language)}
                      className="file-input" 
                      style={{ display: 'none' }}
                    />
                    <label htmlFor={`vtt-input-${subtitle.language}`} className="btn btn-primary">
                      Subir Archivo VTT
                    </label>
                  </div>
                  
                  <button 
                    onClick={() => generateAutomaticSubtitles(subtitle.language)} 
                    className="btn btn-secondary"
                    disabled={!videoPreview}
                  >
                    Generar Automáticamente
                  </button>
                  
                  {subtitle.vttUrl && (
                    <>
                      <button 
                        onClick={() => toggleSubtitles(subtitle.language)} 
                        className={`btn ${activeSubtitles[subtitle.language] ? 'btn-warning' : 'btn-info'}`}
                      >
                        {activeSubtitles[subtitle.language] ? 'Ocultar' : 'Mostrar'}
                      </button>
                      
                      <button 
                        onClick={() => removeSubtitles(subtitle.language)} 
                        className="btn btn-danger"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
                
              </div>
            ))}
          </div>
          
          {/* Controles globales de estilo de subtítulos */}
          {subtitles.some(subtitle => subtitle.vttUrl) && (
            <div className="global-subtitle-colors">
              <h3>Personalizar Estilo de Subtítulos</h3>
              <div className="subtitle-color-controls">
                <div className="color-controls-grid">
                  <div className="color-control">
                    <label htmlFor="globalTextColor">Color de Texto:</label>
                    <input 
                      type="color" 
                      id="globalTextColor"
                      value={subtitles[0].color} 
                      onChange={(e) => updateAllSubtitleColors('color', e.target.value)} 
                    />
                    <span className="color-value">{subtitles[0].color}</span>
                  </div>
                  
                  <div className="color-control">
                    <label htmlFor="globalBgColor">Color de Fondo:</label>
                    <input 
                      type="color" 
                      id="globalBgColor"
                      value={subtitles[0].backgroundColor} 
                      onChange={(e) => updateAllSubtitleColors('backgroundColor', e.target.value)} 
                    />
                    <span className="color-value">{subtitles[0].backgroundColor}</span>
                  </div>
                  
                  <div className="color-control">
                    <label htmlFor="globalFontSize">Tamaño de Fuente:</label>
                    <select 
                      id="globalFontSize"
                      value={subtitles[0].fontSize} 
                      onChange={(e) => updateAllSubtitleFontSize(e.target.value)}
                      className="font-size-selector"
                    >
                      {fontSizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="color-control">
                    <label htmlFor="globalFontFile">Fuente Personalizada (.ttf):</label>
                    <input 
                      type="file" 
                      id="globalFontFile"
                      accept=".ttf"
                      onChange={handleFontFileSelected}
                      className="file-input" 
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="globalFontFile" className="btn btn-secondary">
                      {subtitles[0].fontFile ? subtitles[0].fontFile : 'Subir Fuente TTF'}
                    </label>
                  </div>
                </div>
                
                {/* Vista previa de estilos */}
                <div className="color-preview">
                  <div 
                    className="subtitle-color-sample"
                    style={{
                      color: subtitles[0].color,
                      backgroundColor: subtitles[0].backgroundColor,
                      fontSize: subtitles[0].fontSize,
                      fontFamily: subtitles[0].fontUrl ? 'CustomSubtitleFont' : 'Arial',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      fontWeight: 'bold',
                      border: '1px solid #ccc'
                    }}
                  >
                    Ejemplo de subtítulo
                  </div>
                  {subtitles[0].fontFile && (
                    <div className="font-info">
                      <small>Fuente: {subtitles[0].fontFile}</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
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
