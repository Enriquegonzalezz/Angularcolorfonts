import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../services/AuthContext';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // API URLs
  const imagesApiUrl = 'http://localhost:3000/images';
  const videosApiUrl = 'http://localhost:3000/videos';
  
  // Verificar autenticación al cargar el componente
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    loadMediaItems();
  }, [isAuthenticated, navigate]);
  
  // Cargar elementos multimedia
  const loadMediaItems = () => {
    setLoading(true);
    setError('');
    
    // Cargar imágenes
    axios.get(imagesApiUrl)
      .then(imageResponse => {
        const images = imageResponse.data.images.map(image => ({
          ...image,
          type: 'image',
          createdAt: new Date(image.createdAt)
        }));
        
        // Cargar videos
        axios.get(videosApiUrl)
          .then(videoResponse => {
            const videos = videoResponse.data.videos.map(video => ({
              ...video,
              type: 'video',
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

  return (
    <div className="carousel-container">
      <h2>Media Gallery</h2>
      
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
          <button className="btn btn-primary" onClick={loadMediaItems}>Try Again</button>
        </div>
      )}
      
      {/* Estado vacío */}
      {!loading && !error && mediaItems.length === 0 && (
        <div className="empty-container">
          <p>No media items found. Upload some images or videos first!</p>
        </div>
      )}
      
      {/* Carrusel */}
      {!loading && !error && mediaItems.length > 0 && (
        <div className="carousel">
          <button className="carousel-control prev" onClick={previous}>&lt;</button>
          
          <div className="carousel-items">
            {getVisibleItems().map(item => (
              <div key={item.id} className="carousel-item" onClick={() => showDetails(item)}>
                {/* Elemento de imagen */}
                {item.type === 'image' && (
                  <div className="media-item">
                    <img 
                      src={`http://localhost:3000${item.path}`} 
                      alt={item.originalName} 
                      className="media-thumbnail"
                    />
                    <div className="media-info">
                      <p className="media-name">{item.originalName}</p>
                    </div>
                  </div>
                )}
                
                {/* Elemento de video */}
                {item.type === 'video' && (
                  <div className="media-item">
                    <video 
                      src={`http://localhost:3000${item.path}`} 
                      className="media-thumbnail"
                    />
                    <div className="media-info">
                      <p className="media-name">{item.originalName}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <button className="carousel-control next" onClick={next}>&gt;</button>
        </div>
      )}
      
      {/* Modal de detalles del elemento multimedia */}
      {selectedItem && (
        <div className="media-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedItem.originalName}</h3>
              <button className="close-button" onClick={closeDetails}>&times;</button>
            </div>
            
            <div className="modal-body">
              {/* Detalles de imagen */}
              {selectedItem.type === 'image' && (
                <div>
                  <div className="media-preview">
                    <img 
                      src={`http://localhost:3000${selectedItem.path}`} 
                      alt={selectedItem.originalName}
                    />
                  </div>
                  
                  <div className="media-metadata">
                    <h4>Image Details</h4>
                    <ul>
                      <li><strong>Name:</strong> {selectedItem.originalName}</li>
                      <li><strong>Size:</strong> {formatFileSize(selectedItem.size)}</li>
                      <li><strong>Dimensions:</strong> {selectedItem.width} x {selectedItem.height} px</li>
                      <li><strong>Uploaded:</strong> {formatDate(selectedItem.createdAt)}</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Detalles de video */}
              {selectedItem.type === 'video' && (
                <div>
                  <div className="media-preview">
                    <video 
                      src={`http://localhost:3000${selectedItem.path}`} 
                      controls
                    />
                  </div>
                  
                  <div className="media-metadata">
                    <h4>Video Details</h4>
                    <ul>
                      <li><strong>Name:</strong> {selectedItem.originalName}</li>
                      <li><strong>Size:</strong> {formatFileSize(selectedItem.size)}</li>
                      <li><strong>Format:</strong> {selectedItem.format}</li>
                      <li><strong>Duration:</strong> {formatTime(selectedItem.duration)}</li>
                      <li><strong>Uploaded:</strong> {formatDate(selectedItem.createdAt)}</li>
                    </ul>
                  </div>
                  
                  {/* Sección de subtítulos */}
                  {selectedItem.subtitles && selectedItem.subtitles.length > 0 && (
                    <div className="subtitles-section">
                      <h4>Subtítulos</h4>
                      {selectedItem.subtitles.map(subtitle => (
                        <div key={subtitle.id} className="subtitle-item">
                          <h5>{subtitle.language === 'en' ? 'Inglés' : 'Español'}</h5>
                          <div className="subtitle-preview" style={{
                            color: subtitle.color,
                            backgroundColor: subtitle.backgroundColor,
                            fontSize: subtitle.fontSize,
                            fontFamily: subtitle.fontFamily
                          }}>
                            {subtitle.entries && subtitle.entries.length > 0 ? (
                              <div className="subtitle-entries">
                                {subtitle.entries.map((entry, index) => (
                                  <div key={index} className="subtitle-entry">
                                    <span className="time-range">
                                      {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                                    </span>
                                    <p>{entry.text}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              subtitle.text || 'Sin texto de subtítulos'
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Sección de pistas de audio */}
                  {selectedItem.audioTracks && selectedItem.audioTracks.length > 0 && (
                    <div className="audio-tracks-section">
                      <h4>Audio Tracks</h4>
                      {selectedItem.audioTracks.map(track => (
                        <div key={track.id} className="audio-item">
                          <h5>{track.language === 'en' ? 'English' : 'Spanish'}</h5>
                          <audio src={`http://localhost:3000${track.path}`} controls />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={closeDetails}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaCarousel;
