import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../services/AuthContext';
import { Cropper } from 'react-cropper';
import TangramLoader from '../../../components/tangram-loader/TangramLoader';
import './ImageUpload.css';

const ImageUpload = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getUserId } = useAuth();
  const imageRef = useRef(null);
  const cdrRef = useRef(null);
  
  // Estados para el archivo de imagen
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalImagePreview, setOriginalImagePreview] = useState(null);
  const [cropper, setCropper] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  
  // Metadatos de la imagen
  const [imageName, setImageName] = useState('');
  const [imageSize, setImageSize] = useState(0);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  
  // Datos originales de la imagen (para comparación)
  const [originalImageSize, setOriginalImageSize] = useState(0);
  const [originalImageWidth, setOriginalImageWidth] = useState(0);
  const [originalImageHeight, setOriginalImageHeight] = useState(0);
  
  // Datos del recorte
  const [cropData, setCropData] = useState(null);
  const [isCropped, setIsCropped] = useState(false);
  
  // Estado de la subida
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  
  // Lista de imágenes del usuario
  const [userImages, setUserImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  
  // ID del usuario del servicio de autenticación
  const [userId, setUserId] = useState(null);
  
  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    const id = getUserId();
    if (!id) {
      navigate('/login');
      return;
    }
    
    setUserId(id);
    loadUserImages(id);
  }, [isAuthenticated, getUserId, navigate]);
  
  // Cargar imágenes del usuario
  const loadUserImages = (id) => {
    if (!id) {
      console.error('No user ID available');
      return;
    }
    
    setIsLoadingImages(true);
    axios.get(`http://localhost:3000/images/user/${id}`)
      .then(response => {
        setUserImages(response.data.images);
        setIsLoadingImages(false);
      })
      .catch(error => {
        console.error('Error loading images:', error);
        setIsLoadingImages(false);
      });
  };
  
  // Manejar selección de archivo
  const onFileSelected = (event) => {
    const input = event.target;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      setImageFile(file);
      setImageName(file.name);
      setImageSize(file.size);
      setIsCropped(false);
      setCropData(null);
      
      // Crear previsualización
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        
        // Obtener dimensiones
        const img = new Image();
        img.onload = () => {
          setImageWidth(img.width);
          setImageHeight(img.height);
          // Guardar datos originales para comparación
          setOriginalImageSize(file.size);
          setOriginalImageWidth(img.width);
          setOriginalImageHeight(img.height);
          // Guardar la vista previa original
          setOriginalImagePreview(reader.result);
          console.log('Dimensiones de imagen cargada:', img.width, 'x', img.height);
        };
        img.onerror = () => {
          console.error('Error cargando imagen para obtener dimensiones');
          // Valores por defecto si no se pueden obtener las dimensiones
          setImageWidth(800);
          setImageHeight(600);
          setOriginalImageWidth(800);
          setOriginalImageHeight(600);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Iniciar recorte
  const startCropping = () => {
    setIsCropping(true);
    setCropData(null); // Reset crop data
  };
  
  // Aplicar recorte
  const applyCrop = () => {
    if (!cropper) {
      console.error('Cropper not initialized');
      return;
    }
    
    try {
      // Obtener datos del recorte
      const cropData = cropper.getData();
      setCropData(cropData);
      
      // Obtener imagen recortada como base64
      const croppedCanvas = cropper.getCroppedCanvas();
      const croppedImage = croppedCanvas.toDataURL('image/jpeg');
      
      // Crear un nuevo archivo a partir de la imagen recortada
      croppedCanvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas to Blob conversion failed');
          return;
        }
        
        // Crear un nuevo archivo con el mismo nombre
        const croppedFile = new File([blob], imageFile.name, {
          type: 'image/jpeg',
          lastModified: new Date().getTime()
        });
        
        // Actualizar el estado con la nueva imagen recortada
        setImageFile(croppedFile);
        setImagePreview(croppedImage);
        setImageSize(croppedFile.size);
        
        // Obtener dimensiones de la imagen recortada
        const img = new Image();
        img.onload = () => {
          setImageWidth(img.width);
          setImageHeight(img.height);
          setIsCropped(true);
          setIsCropping(false);
        };
        img.src = croppedImage;
      }, 'image/jpeg');
    } catch (error) {
      console.error('Error applying crop:', error);
      setIsCropping(false);
    }
  };
  
  // Cancelar recorte
  const cancelCrop = () => {
    setIsCropping(false);
    if (cropper) {
      setCropper(null);
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
  
  // Subir imagen
  const uploadImage = () => {
    if (!imageFile) {
      setUploadError('No image selected');
      return;
    }
    
    // Validar que tenemos dimensiones válidas
    if (imageWidth <= 0 || imageHeight <= 0) {
      console.warn('Dimensiones inválidas, usando valores por defecto');
      setImageWidth(prev => prev || 800);
      setImageHeight(prev => prev || 600);
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);
    setUploadError('');
    
    // Create form data with additional metadata
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('userId', userId.toString());
    formData.append('isCropped', isCropped.toString());
    
    // Agregar datos del recorte si la imagen fue recortada
    if (isCropped && cropData) {
      formData.append('cropData', JSON.stringify(cropData));
      console.log('📤 Enviando datos de recorte al backend:', cropData);
    } else if (isCropped) {
      console.warn('⚠️ Imagen marcada como recortada pero no hay datos de recorte');
    }
    
    // Agregar metadatos adicionales
    formData.append('originalWidth', imageWidth.toString());
    formData.append('originalHeight', imageHeight.toString());
    formData.append('originalSize', imageSize.toString());
    
    console.log('Subiendo imagen:', {
      fileName: imageFile.name,
      size: imageFile.size,
      width: imageWidth,
      height: imageHeight,
      isCropped: isCropped,
      cropData: cropData
    });
    
    // Upload to backend
    axios.post('http://localhost:3000/images/upload', formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      }
    }).then(response => {
      setIsUploading(false);
      setUploadSuccess(true);
      if (response.data && response.data.image) {
        setUploadedImageUrl(response.data.image.imageUrl);
        console.log('Imagen subida exitosamente:', response.data.image);
        // Reload user images after successful upload
        loadUserImages(userId);
      }
    }).catch(error => {
      setIsUploading(false);
      setUploadError(`Error en la subida: ${error.message}`);
      console.error('Error uploading image:', error);
    });
  };
  
  // Resetear subida
  const resetUpload = () => {
    setImageFile(null);
    setImagePreview(null);
    setOriginalImagePreview(null);
    setImageName('');
    setImageSize(0);
    setImageWidth(0);
    setImageHeight(0);
    setOriginalImageSize(0);
    setOriginalImageWidth(0);
    setOriginalImageHeight(0);
    setCropData(null);
    setIsCropped(false);
    setUploadSuccess(false);
    setUploadError('');
  };
  
  // Alternar selección de imagen
  const toggleImageSelection = (imageId) => {
    setUserImages(prevImages => 
      prevImages.map(img => 
        img.id === imageId 
          ? { ...img, selected: !img.selected } 
          : img
      )
    );
  };
  
  // Eliminar imagen
  const deleteImage = (imageId) => {
    // Aquí iría la lógica para eliminar una imagen
    // Esta función requeriría una llamada a la API del backend
  };

  return (
    <div className="image-upload-container">
      <TangramLoader isLoading={isUploading || isLoadingImages} onSkip={() => {
        setIsUploading(false);
        setIsLoadingImages(false);
      }} />
      {!imagePreview && (
        <div className="upload-section">
          <h2>Subir Imagen</h2>
          <div className="upload-box">
            <input 
              type="file" 
              onChange={onFileSelected} 
              accept="image/*" 
              id="fileInput" 
              className="file-input" 
            />
            <label htmlFor="fileInput" className="file-label">
              <span>Elegir una imagen</span>
            </label>
          </div>
        </div>
      )}

      {imagePreview && !isCropping && (
        <div className="preview-section">
          <h2>Vista Previa de la Imagen</h2>
          
          {isCropped && (
            <div className="crop-badge">
              <span className="badge badge-success">Imagen Recortada</span>
            </div>
          )}
          
          {isCropped ? (
            <div className="image-comparison">
              <div className="comparison-container">
                <div className="original-image-section">
                  <h3>📷 Imagen Original</h3>
                  <div className="image-preview">
                    <img src={originalImagePreview} alt="Original" className="original-preview" />
                  </div>
                  <div className="image-metadata">
                    <h4>Detalles Originales</h4>
                    <ul>
                      <li><strong>Nombre:</strong> {imageName}</li>
                      <li><strong>Tamaño:</strong> {formatFileSize(originalImageSize)}</li>
                      <li><strong>Dimensiones:</strong> {originalImageWidth} x {originalImageHeight} px</li>
                      <li><strong>Estado:</strong> <span className="badge badge-secondary">Original</span></li>
                    </ul>
                  </div>
                </div>
                
                <div className="vs-separator">
                  <div className="vs-circle">VS</div>
                </div>
                
                <div className="cropped-image-section">
                  <h3>✂️ Imagen Recortada</h3>
                  <div className="image-preview">
                    <img src={imagePreview} alt="Cropped" className="cropped-preview" />
                  </div>
                  <div className="image-metadata">
                    <h4>Detalles Recortados</h4>
                    <ul>
                      <li><strong>Nombre:</strong> {imageName}</li>
                      <li><strong>Tamaño:</strong> {formatFileSize(imageSize)}</li>
                      <li><strong>Dimensiones:</strong> {imageWidth} x {imageHeight} px</li>
                      <li><strong>Estado:</strong> <span className="badge badge-success">Recortada</span></li>
                      {cropData && (
                        <li>
                          <strong>Datos de Recorte:</strong> 
                          <div className="crop-details">
                            <small>Posición: X: {cropData.x.toFixed(2)}, Y: {cropData.y.toFixed(2)}</small><br />
                            <small>Área: {cropData.width.toFixed(2)} x {cropData.height.toFixed(2)} px</small>
                            {cropData.rotate !== 0 && (
                              <><br /><small>Rotación: {cropData.rotate}°</small></>
                            )}
                          </div>
                        </li>
                      )}
                      
                      <li>
                        <strong>Reducción de Tamaño:</strong> 
                        <span className="size-reduction-badge">
                          {((originalImageSize - imageSize) / originalImageSize * 100).toFixed(1)}% más pequeño
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
              
              <div className="image-metadata">
                <h3>Detalles de la Imagen</h3>
                <ul>
                  <li><strong>Nombre:</strong> {imageName}</li>
                  <li><strong>Tamaño:</strong> {formatFileSize(imageSize)}</li>
                  <li><strong>Dimensiones:</strong> {imageWidth} x {imageHeight} px</li>
                  <li><strong>Estado:</strong> <span className="badge badge-secondary">Original</span></li>
                </ul>
              </div>
            </>
          )}
          
          <div className="action-buttons">
            {!isCropped && (
              <button onClick={startCropping} className="btn btn-primary">Recortar Imagen</button>
            )}
            <button onClick={uploadImage} className="btn btn-success">Subir Imagen</button>
            <button onClick={resetUpload} className="btn btn-secondary">Nueva Imagen</button>
          </div>
        </div>
      )}

      {isCropping && (
        <div className="cropping-section">
          <h2>Recortar Imagen</h2>
          <div className="cropper-container">
            <Cropper
              ref={imageRef}
              src={imagePreview}
              style={{ height: 400, width: '100%' }}
              aspectRatio={16 / 9}
              guides={true}
              crop={(e) => console.log(e.detail)}
              onInitialized={(instance) => setCropper(instance)}
            />
          </div>
          
          <div className="cropper-instructions">
            <h4>Instrucciones de Recorte:</h4>
            <ul className="crop-instructions-list">
              <li><i className="fas fa-arrows-alt"></i> <strong>Mover imagen:</strong> Arrastra dentro del área de recorte</li>
              <li><i className="fas fa-expand-arrows-alt"></i> <strong>Redimensionar:</strong> Arrastra los bordes o esquinas</li>
              <li><i className="fas fa-crop-alt"></i> <strong>Ajustar área:</strong> Mueve el marco de recorte</li>
            </ul>
          </div>
          
          <div className="crop-preview-info">
            {cropData && (
              <div className="crop-dimensions">
                <span className="dimension-badge">{Math.round(cropData.width)} x {Math.round(cropData.height)} px</span>
              </div>
            )}
          </div>
          
          <div className="action-buttons">
            <button onClick={applyCrop} className="btn btn-primary"><i className="fas fa-check"></i> Aplicar Recorte</button>
            <button onClick={cancelCrop} className="btn btn-danger"><i className="fas fa-times"></i> Cancelar</button>
          </div>
        </div>
      )}

      {uploadSuccess && (
        <div className="upload-success">
          <h3>¡Imagen Subida Exitosamente!</h3>
          <div className="success-details">
            <p><strong>URL:</strong> {uploadedImageUrl}</p>
            <p><strong>Estado:</strong> Guardada en base de datos</p>
          </div>
          <button onClick={resetUpload} className="btn btn-primary">Subir Otra Imagen</button>
        </div>
      )}

      {uploadError && (
        <div className="upload-error">
          <h3>Error en la Subida</h3>
          <p>{uploadError}</p>
          <button onClick={() => setUploadError('')} className="btn btn-danger">Cerrar</button>
        </div>
      )}

      {isUploading && (
        <div className="upload-progress">
          <h3>Subiendo Imagen...</h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
          </div>
          <p>{uploadProgress}% completado</p>
        </div>
      )}

      {/* Lista de Imágenes del Usuario */}
      <div className="user-images-section">
        <h2>Mis Imágenes</h2>
        
        {isLoadingImages ? (
          <div className="loading-images">
            <p>Cargando imágenes...</p>
          </div>
        ) : userImages.length === 0 ? (
          <div className="no-images">
            <p>No tienes imágenes subidas aún.</p>
          </div>
        ) : (
          <div className="images-grid">
            {userImages.map(image => (
              <div key={image.id} className={`image-card ${image.selected ? 'selected' : ''}`}>
                <div className="image-card-header">
                  {image.selected && (
                    <span className="selection-badge">Seleccionada</span>
                  )}
                  {image.isCropped ? (
                    <span className="crop-badge-small">✂️ Recortada</span>
                  ) : (
                    <span className="original-badge">📷 Original</span>
                  )}
                </div>
                
                <div className="image-card-body">
                  <img 
                    src={`http://localhost:3000/public${image.imageUrl}`} 
                    alt={image.originalName} 
                    className="image-thumbnail" 
                  />
                  
                  <div className="image-info">
                    <h4>{image.originalName}</h4>
                    <p><strong>Tamaño:</strong> {formatFileSize(image.size)}</p>
                    <p><strong>Dimensiones:</strong> {image.width} x {image.height} px</p>
                    <p><strong>Fecha:</strong> {new Date(image.createdAt).toLocaleString()}</p>
                    
                    {image.characteristics && (
                      <div className="characteristics-info">
                        <p><strong>Características:</strong></p>
                        <ul>
                          {image.isCropped ? (
                            <>
                              <li><strong>Original:</strong> {image.characteristics.originalWidth} x {image.characteristics.originalHeight} px</li>
                              <li><strong>Recortada:</strong> {image.characteristics.finalWidth} x {image.characteristics.finalHeight} px</li>
                              {image.characteristics.cropData && (
                                <>
                                  <li><strong>Área recortada:</strong> {image.characteristics.cropData.width} x {image.characteristics.cropData.height} px</li>
                                  <li><strong>Posición:</strong> X:{Math.round(image.characteristics.cropData.x)}, Y:{Math.round(image.characteristics.cropData.y)}</li>
                                </>
                              )}
                            </>
                          ) : (
                            <li><strong>Dimensiones:</strong> {image.characteristics.finalWidth} x {image.characteristics.finalHeight} px</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="image-card-actions">
                  <button 
                    onClick={() => toggleImageSelection(image.id)} 
                    className={`btn ${image.selected ? 'btn-warning' : 'btn-primary'}`}
                  >
                    {image.selected ? 'Deseleccionar' : 'Seleccionar'}
                  </button>
                  
                  <button 
                    onClick={() => deleteImage(image.id)} 
                    className="btn btn-danger"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
