import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../services/AuthContext';
import TangramLoader from '../../../components/tangram-loader/TangramLoader';
import './MediaCarousel.css';

// Definición de la interfaz MediaItem
/**
 * @typedef {Object} MediaItem
 * @property {string} id - ID único del elemento multimedia
 * @property {'image' | 'video'} type - Tipo de elemento multimedia
 * @property {string} fileName - Nombre del archivo en el servidor
 * @property {string} originalName - Nombre original del archivo
 * @property {string} path - Ruta relativa al archivo en el servidor
 * @property {number} size - Tamaño del archivo en bytes
 * @property {Date} createdAt - Fecha de creación
 * @property {number} [width] - Ancho de la imagen (solo para imágenes)
 * @property {number} [height] - Alto de la imagen (solo para imágenes)
 * @property {number} [duration] - Duración del video en segundos (solo para videos)
 * @property {string} [format] - Formato del video (solo para videos)
 * @property {Array} [subtitles] - Subtítulos del video (solo para videos)
 * @property {Array} [audioTracks] - Pistas de audio del video (solo para videos)
 */

const MediaCarousel = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState('');
  const [userColors, setUserColors] = useState(null);
  const [isLoadingStyles, setIsLoadingStyles] = useState(true);
  
  const navigate = useNavigate();
  const { isAuthenticated, getUserId } = useAuth();
  const userId = getUserId();
  
  // API URLs
  const imagesApiUrl = `http://localhost:3000/images?userId=${userId}&selected=1`;
  const videosApiUrl = `http://localhost:3000/videos?userId=${userId}&selected=1`;
  
  // Cargar estilos del usuario
  const loadUserStyles = async () => {
    if (!userId) return;
    
    try {
      const response = await axios.get(`http://localhost:3000/videos/default-styles?userId=${userId}`);
      setUserColors(response.data);
      setIsLoadingStyles(false);
    } catch (error) {
      console.error('Error loading user styles:', error);
      setIsLoadingStyles(false);
    }
  };

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    loadMediaItems();
    loadUserStyles();
  }, [isAuthenticated, navigate, userId]);
  
  // Cargar elementos multimedia
  const loadMediaItems = () => {
    setLoading(true);
    setError('');
    
    // Cargar imágenes
    axios.get(imagesApiUrl)
      .then(imageResponse => {
        const images = imageResponse.data.images.map((image, index) => ({
          ...image,
          type: 'image',
          uniqueId: `image-${image.id || 'noId'}-${image.nombre_archivo || image.nombre_original || 'noName'}-${Date.now()}-${index}`,
          createdAt: new Date(image.createdAt)
        }));
        
        // Cargar videos
        axios.get(videosApiUrl)
          .then(videoResponse => {
            const videos = videoResponse.data.videos.map((video, index) => ({
              ...video,
              type: 'video',
              uniqueId: `video-${video.id || 'noId'}-${video.nombre_archivo || video.nombre_original || 'noName'}-${Date.now()}-${index}`,
              createdAt: new Date(video.createdAt)
            }));
            
            // Combinar y ordenar por fecha de creación (más recientes primero)
            const allMedia = [...images, ...videos].sort((a, b) => 
              b.createdAt.getTime() - a.createdAt.getTime()
            );
            
            setMediaItems(allMedia);
            setLoading(false);
          })
          .catch(error => {
            console.error('Error loading videos:', error);
            setError('Failed to load videos');
            setLoading(false);
          });
      })
      .catch(error => {
        console.error('Error loading images:', error);
        setError('Failed to load images');
        setLoading(false);
      });
  };
  
  // Obtener elementos visibles en el carrusel
  const getVisibleItems = () => {
    if (mediaItems.length === 0) return [];
    
    const itemCount = mediaItems.length;
    const items = [];
    
    // Obtener 3 elementos a partir del índice actual
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % itemCount;
      items.push(mediaItems[index]);
    }
    
    return items;
  };
  
  // Avanzar al siguiente elemento
  const next = () => {
    if (mediaItems.length === 0) return;
    setCurrentIndex((currentIndex + 1) % mediaItems.length);
  };
  
  // Retroceder al elemento anterior
  const previous = () => {
    if (mediaItems.length === 0) return;
    setCurrentIndex((currentIndex - 1 + mediaItems.length) % mediaItems.length);
  };
  
  // Mostrar detalles de un elemento
  const showDetails = (item) => {
    setSelectedItem(item);
  };
  
  // Cerrar detalles
  const closeDetails = () => {
    setSelectedItem(null);
  };

  // Alternar selección de elemento
  const toggleSelection = async (item) => {
    try {
      const endpoint = item.type === 'image' 
        ? `http://localhost:3000/images/${item.id}/select`
        : `http://localhost:3000/videos/${item.id}/select`;
      
      const newSelectionState = item.seleccionada === 1 ? 0 : 1;
      
      await axios.put(endpoint, { 
        userId: userId,
        selected: newSelectionState 
      });
      
      // Actualizar el estado local
      setMediaItems(prevItems => 
        prevItems.map(mediaItem => 
          mediaItem.id === item.id 
            ? { ...mediaItem, seleccionada: newSelectionState }
            : mediaItem
        )
      );
    } catch (error) {
      console.error('Error toggling selection:', error);
      setError('Failed to update selection');
    }
  };
  
  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Formatear tiempo en segundos a formato mm:ss
  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString();
  };

  // Aplicar estilos del usuario
  const containerStyle = userColors ? {
    backgroundColor: userColors.backgroundColor,
    color: userColors.textColor,
    fontFamily: userColors.fontFamily
  } : {};

  const titleStyle = userColors ? {
    color: userColors.color1,
    fontFamily: userColors.fontFamily,
    fontSize: userColors.fontSize
  } : {};

  const buttonStyle = userColors ? {
    backgroundColor: userColors.color2,
    color: userColors.textColor,
    borderColor: userColors.color3
  } : {};

  if (isLoadingStyles) {
    return <TangramLoader userId={userId} isLoading={true} onSkip={() => setIsLoadingStyles(false)} />;
  }

  return (
    <div className="carousel-container" style={containerStyle}>
      <h2 style={titleStyle}>Galería de Medios</h2>
      
      {/* Estado de carga */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading media items...</p>
        </div>
      )}
      
      {/* Estado de error */}
      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="btn btn-primary" style={buttonStyle} onClick={loadMediaItems}>Intentar de nuevo</button>
        </div>
      )}
      
      {/* Estado vacío */}
      {!loading && !error && mediaItems.length === 0 && (
        <div className="empty-container">
          <p>No se encontraron medios seleccionados. ¡Sube y selecciona algunas imágenes o videos primero!</p>
        </div>
      )}
      
      {/* Carrusel */}
      {!loading && !error && mediaItems.length > 0 && (
        <div className="carousel">
          <button className="carousel-control prev" style={buttonStyle} onClick={previous}>&lt;</button>
          
          <div className="carousel-items">
            {getVisibleItems().map(item => (
              <div key={item.uniqueId} className="carousel-item">
                <div className="media-item">
                  {/* Checkbox de selección */}
                  <div className="selection-checkbox">
                    <input
                      type="checkbox"
                      checked={item.seleccionada === 1}
                      onChange={() => toggleSelection(item)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Elemento de imagen */}
                  {item.type === 'image' && (
                    <div className="media-content" onClick={() => showDetails(item)}>
                      <img 
                        src={`http://localhost:3000/public/uploads/images/${item.nombre_archivo}`} 
                        alt={item.nombre_original} 
                        className="media-thumbnail"
                      />
                      <div className="media-info">
                        <p className="media-name">{item.nombre_original}</p>
                        <p className="media-size">{formatFileSize(item.tamano)}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Elemento de video */}
                  {item.type === 'video' && (
                    <div className="media-content" onClick={() => showDetails(item)}>
                      <video 
                        src={`http://localhost:3000/public/uploads/videos/${item.nombre_archivo}`} 
                        className="media-thumbnail"
                        muted
                      />
                      <div className="media-info">
                        <p className="media-name">{item.nombre_original}</p>
                        <p className="media-size">{formatFileSize(parseInt(item.tamano))}</p>
                        <p className="media-duration">{item.duracion}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button className="carousel-control next" style={buttonStyle} onClick={next}>&gt;</button>
        </div>
      )}
      
      {/* Modal de detalles del elemento multimedia */}
      {selectedItem && (
        <div className="media-details-modal">
          <div className="modal-content" style={containerStyle}>
            <div className="modal-header">
              <h3 style={titleStyle}>{selectedItem.nombre_original}</h3>
              <button className="close-button" style={buttonStyle} onClick={closeDetails}>&times;</button>
            </div>
            
            <div className="modal-body">
              {/* Detalles de imagen */}
              {selectedItem.type === 'image' && (
                <div>
                  <div className="media-preview">
                    <img 
                      src={`http://localhost:3000/public/uploads/images/${selectedItem.nombre_archivo}`} 
                      alt={selectedItem.nombre_original}
                    />
                  </div>
                  
                  <div className="media-metadata">
                    <h4>Image Details</h4>
                    <ul>
                      <li><strong>Name:</strong> {selectedItem.nombre_original}</li>
                      <li><strong>Size:</strong> {formatFileSize(selectedItem.tamano)}</li>
                      <li><strong>Dimensions:</strong> {selectedItem.ancho} x {selectedItem.alto} px</li>
                      <li><strong>Type:</strong> {selectedItem.tipo_mime}</li>
                      <li><strong>Selected:</strong> {selectedItem.seleccionada === 1 ? 'Yes' : 'No'}</li>
                      <li><strong>Uploaded:</strong> {formatDate(selectedItem.fecha_creacion)}</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Detalles de video */}
              {selectedItem.type === 'video' && (
                <div>
                  <div className="media-preview">
                    <video 
                      src={`http://localhost:3000/public/uploads/videos/${selectedItem.nombre_archivo}`} 
                      controls
                    />
                  </div>
                  
                  <div className="media-metadata">
                    <h4>Video Details</h4>
                    <ul>
                      <li><strong>Name:</strong> {selectedItem.nombre_original}</li>
                      <li><strong>Size:</strong> {formatFileSize(parseInt(selectedItem.tamano))}</li>
                      <li><strong>Format:</strong> {selectedItem.extension}</li>
                      <li><strong>Duration:</strong> {selectedItem.duracion}</li>
                      <li><strong>Selected:</strong> {selectedItem.seleccionada === 1 ? 'Yes' : 'No'}</li>
                      <li><strong>Uploaded:</strong> {formatDate(selectedItem.createdAt)}</li>
                    </ul>
                  </div>
                  
                  {/* Sección de subtítulos */}
                  {(selectedItem.nombre_subtitulo_1 || selectedItem.nombre_subtitulo_2) && (
                    <div className="subtitles-section">
                      <h4>Subtítulos</h4>
                      
                      {selectedItem.nombre_subtitulo_1 && (
                        <div className="subtitle-item">
                          <h5>Español</h5>
                          <div className="subtitle-file">
                            <p><strong>File:</strong> {selectedItem.nombre_subtitulo_1}</p>
                            <video 
                              src={`http://localhost:3000/public/uploads/videos/${selectedItem.nombre_archivo}`}
                              controls
                              style={{ width: '100%', maxWidth: '400px' }}
                            >
                              <track 
                                kind="subtitles" 
                                src={`http://localhost:3000/public/uploads/subtitles/${selectedItem.nombre_subtitulo_1}`}
                                srcLang="es" 
                                label="Español"
                                default
                              />
                            </video>
                          </div>
                        </div>
                      )}

                      {selectedItem.nombre_subtitulo_2 && (
                        <div className="subtitle-item">
                          <h5>English</h5>
                          <div className="subtitle-file">
                            <p><strong>File:</strong> {selectedItem.nombre_subtitulo_2}</p>
                            <video 
                              src={`http://localhost:3000/public/uploads/videos/${selectedItem.nombre_archivo}`}
                              controls
                              style={{ width: '100%', maxWidth: '400px' }}
                            >
                              <track 
                                kind="subtitles" 
                                src={`http://localhost:3000/public/uploads/subtitles/${selectedItem.nombre_subtitulo_2}`}
                                srcLang="en" 
                                label="English"
                                default
                              />
                            </video>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Sección de pistas de audio */}
                  {(selectedItem.nombre_audio_1 || selectedItem.nombre_audio_2) && (
                    <div className="audio-tracks-section">
                      <h4>Audio Tracks</h4>
                      
                      {selectedItem.nombre_audio_1 && (
                        <div className="audio-item">
                          <h5>Español</h5>
                          <p><strong>File:</strong> {selectedItem.nombre_audio_1}</p>
                          <audio 
                            src={`http://localhost:3000/public/uploads/audio/${selectedItem.nombre_audio_1}`} 
                            controls 
                            style={{ width: '100%' }}
                          />
                        </div>
                      )}

                      {selectedItem.nombre_audio_2 && (
                        <div className="audio-item">
                          <h5>English</h5>
                          <p><strong>File:</strong> {selectedItem.nombre_audio_2}</p>
                          <audio 
                            src={`http://localhost:3000/public/uploads/audio/${selectedItem.nombre_audio_2}`} 
                            controls 
                            style={{ width: '100%' }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-primary" style={buttonStyle} onClick={closeDetails}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaCarousel;
