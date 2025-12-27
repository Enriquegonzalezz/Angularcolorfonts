import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../services/AuthContext';
import TangramLoader from '../../../components/tangram-loader/TangramLoader';
import './MediaCarousel.css';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

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
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState('');
  const [userColors, setUserColors] = useState(null);
  const [isLoadingStyles, setIsLoadingStyles] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const videoRef = useRef(null);
  
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
          uniqueId: `image-${image.id || 'noId'}-${image.nombre_archivo || image.fileName || 'noName'}-${Date.now()}-${index}`,
          createdAt: new Date(image.createdAt || image.fecha_creacion)
        }));
        
        // Cargar videos
        axios.get(videosApiUrl)
          .then(videoResponse => {
            const videos = videoResponse.data.videos.map((video, index) => ({
              ...video,
              type: 'video',
              uniqueId: `video-${video.id || 'noId'}-${video.nombre_archivo || video.fileName || 'noName'}-${Date.now()}-${index}`,
              createdAt: new Date(video.createdAt || video.fecha_creacion)
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
  
  // Mostrar detalles de un elemento
  const showDetails = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };
  
  // Cerrar detalles
  const closeDetails = () => {
    setSelectedItem(null);
    setModalOpen(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Alternar selección de elemento
  const toggleSelection = async (item, e) => {
    e.stopPropagation(); // Prevent triggering showDetails
    try {
      const endpoint = item.type === 'image' 
        ? `http://localhost:3000/images/${item.id}/select`
        : `http://localhost:3000/videos/${item.id}/select`;
      
      const newSelectionState = (item.seleccionada === 1 || item.selected === true) ? 0 : 1;
      
      await axios.put(endpoint, { 
        userId: userId,
        selected: newSelectionState 
      });
      
      // Actualizar el estado local
      setMediaItems(prevItems => 
        prevItems.map(mediaItem => 
          mediaItem.id === item.id 
            ? { ...mediaItem, seleccionada: newSelectionState, selected: newSelectionState }
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
    if (bytes === 0 || bytes === undefined || bytes === null || isNaN(bytes)) return '0 Bytes';
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
      
      {/* Carrusel con Swiper */}
      {!loading && !error && mediaItems.length > 0 && (
        <div className="swiper-container">
          <Swiper
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            pagination={true}
            navigation={true}
            modules={[EffectCoverflow, Pagination, Navigation]}
            className="mySwiper"
          >
            {mediaItems.map(item => (
              <SwiperSlide key={item.uniqueId}>
                <div className="media-card" onClick={() => showDetails(item)}>
                  {/* Checkbox de selección */}
                  <div className="selection-checkbox">
                    <input
                      type="checkbox"
                      checked={(item.seleccionada === 1) || item.selected === true}
                      onChange={(e) => toggleSelection(item, e)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Elemento de imagen */}
                  {item.type === 'image' && (
                    <div className="media-content">
                      {(() => { const file = item.nombre_archivo || item.fileName; return (
                        <img 
                          src={`http://localhost:3000/public/uploads/images/${file}`} 
                          alt={item.nombre_original || item.originalName} 
                          className="media-thumbnail"
                        />
                      ); })()}
                      <div className="media-info">
                        <p className="media-name">{item.nombre_original || item.originalName}</p>
                        <p className="media-size">{formatFileSize(item.tamano || item.size)}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Elemento de video */}
                  {item.type === 'video' && (
                    <div className="media-content">
                      {(() => { const file = item.nombre_archivo || item.fileName; return (
                        <video 
                          src={`http://localhost:3000/public/uploads/videos/${file}`} 
                          className="media-thumbnail"
                          muted
                        />
                      ); })()}
                      <div className="media-info">
                        <p className="media-name">{item.nombre_original || item.originalName}</p>
                        <p className="media-size">{formatFileSize(parseInt(item.tamano || item.size))}</p>
                        <p className="media-duration">{item.duracion || item.duration}</p>
                      </div>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
      
      {/* Modal para visualizar medios */}
      {modalOpen && selectedItem && (
        <div className="media-modal-overlay" onClick={closeDetails}>
          <div className="media-modal-content" onClick={(e) => e.stopPropagation()} style={containerStyle}>
            <div className="modal-header">
              <h3 style={titleStyle}>{selectedItem.nombre_original || selectedItem.originalName}</h3>
              <button className="close-button" style={buttonStyle} onClick={closeDetails}>&times;</button>
            </div>
            
            <div className="modal-body">
              {/* Contenido de imagen */}
              {selectedItem.type === 'image' && (
                <div className="media-preview">
                  {(() => { const file = selectedItem.nombre_archivo || selectedItem.fileName; return (
                    <img 
                      src={`http://localhost:3000/public/uploads/images/${file}`} 
                      alt={selectedItem.nombre_original || selectedItem.originalName}
                      className="modal-media-content"
                    />
                  ); })()}
                </div>
              )}
              
              {/* Contenido de video */}
              {selectedItem.type === 'video' && (
                <div className="media-preview">
                  {(() => { const file = selectedItem.nombre_archivo || selectedItem.fileName; return (
                    <video 
                      ref={videoRef}
                      src={`http://localhost:3000/public/uploads/videos/${file}`} 
                      controls
                      autoPlay
                      className="modal-media-content"
                    >
                      {selectedItem.nombre_subtitulo_1 && (
                        <track 
                          kind="subtitles" 
                          src={`http://localhost:3000/public/uploads/subtitles/${selectedItem.nombre_subtitulo_1}`}
                          srcLang="es" 
                          label="Español"
                        />
                      )}
                      {selectedItem.nombre_subtitulo_2 && (
                        <track 
                          kind="subtitles" 
                          src={`http://localhost:3000/public/uploads/subtitles/${selectedItem.nombre_subtitulo_2}`}
                          srcLang="en" 
                          label="English"
                        />
                      )}
                    </video>
                  ); })()}
                </div>
              )}
              
              {/* Información del medio */}
              <div className="media-details">
                <h4>Detalles</h4>
                <ul>
                  <li><strong>Nombre:</strong> {selectedItem.nombre_original || selectedItem.originalName}</li>
                  <li><strong>Tamaño:</strong> {formatFileSize(selectedItem.type === 'image' ? (selectedItem.tamano || selectedItem.size) : parseInt(selectedItem.tamano || selectedItem.size))}</li>
                  {selectedItem.type === 'image' && (
                    <li><strong>Dimensiones:</strong> {(selectedItem.ancho || selectedItem.width)} x {(selectedItem.alto || selectedItem.height)} px</li>
                  )}
                  {selectedItem.type === 'video' && (
                    <li><strong>Duración:</strong> {selectedItem.duracion || selectedItem.duration}</li>
                  )}
                  <li><strong>Fecha de subida:</strong> {formatDate(selectedItem.createdAt || selectedItem.fecha_creacion)}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaCarousel;
