import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'cropperjs';
import axios from 'axios';
import 'cropperjs/dist/cropper.min.css';
import './ImageUpload.css';

const ImageUpload = () => {
  // Referencias a elementos DOM
  const imageInputRef = useRef(null);
  const imageToCropRef = useRef(null);
  const cropperContainerRef = useRef(null);
  const resultSectionRef = useRef(null);
  const resultContainerRef = useRef(null);
  
  // Estados para guardar información
  const [originalFile, setOriginalFile] = useState(null);
  const [cropper, setCropper] = useState(null);
  const [originalDetails, setOriginalDetails] = useState({
    name: '',
    dimensions: '',
    size: '',
    type: ''
  });
  const [resultDetails, setResultDetails] = useState({
    name: '',
    dimensions: '',
    size: '',
    type: ''
  });
  const [showOriginalDetails, setShowOriginalDetails] = useState(false);
  const [showCropperContainer, setShowCropperContainer] = useState(false);
  const [showCropButton, setShowCropButton] = useState(false);
  const [showResultSection, setShowResultSection] = useState(false);
  const [resultImageSrc, setResultImageSrc] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  
  // Función para formatear bytes a KB, MB, etc.
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  // Manejar cambio de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      return;
    }
    
    setOriginalFile(file);
    
    // Mostrar detalles del archivo original
    setOriginalDetails({
      name: file.name,
      size: formatBytes(file.size),
      type: file.type,
      dimensions: '' // Se actualizará cuando la imagen se cargue
    });
    setShowOriginalDetails(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (imageToCropRef.current) {
        imageToCropRef.current.src = event.target.result;
        
        // Esperar a que la imagen se cargue para obtener sus dimensiones reales
        imageToCropRef.current.onload = () => {
          setOriginalDetails(prev => ({
            ...prev,
            dimensions: `${imageToCropRef.current.naturalWidth} x ${imageToCropRef.current.naturalHeight} px`
          }));
          
          setShowCropperContainer(true);
          setShowCropButton(true);
          setShowResultSection(false); // Ocultar resultados anteriores
          setUploadSuccess(false);
          setUploadError('');
          setUploadedImageUrl('');
          
          if (cropper) {
            cropper.destroy();
          }
          
          // Inicializar Cropper.js
          const newCropper = new Cropper(imageToCropRef.current, {
            aspectRatio: 1, // Recorte cuadrado
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 0.9,
            responsive: true,
            cropBoxResizable: true,
            guides: true,
          });
          
          setCropper(newCropper);
        };
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Manejar recorte de imagen
  const handleCrop = () => {
    if (!cropper) {
      return;
    }
    
    const cropOptions = {
      width: 800,
      height: 800,
      imageSmoothingQuality: 'high',
    };
    
    // Obtener el canvas con la imagen recortada
    const canvas = cropper.getCroppedCanvas(cropOptions);
    
    // Convertir canvas a Data URL (formato base64) para mostrar y calcular peso
    const mimeType = 'image/jpeg';
    const dataURL = canvas.toDataURL(mimeType, 0.9); // 0.9 es la calidad para JPEG
    
    // Calcular el peso de la imagen recortada
    const base64Data = dataURL.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    // Actualizar detalles de la imagen recortada
    setResultDetails({
      name: `recorte-${originalFile.name}`,
      dimensions: `${cropOptions.width} x ${cropOptions.height} px`,
      size: formatBytes(blob.size),
      type: mimeType
    });
    
    // Mostrar la imagen recortada
    setResultImageSrc(dataURL);
    setShowResultSection(true);
    
    // Scroll a la sección de resultados
    if (resultSectionRef.current) {
      resultSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Guardar imagen en el servidor
  const handleSaveImage = async () => {
    if (!resultImageSrc) {
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');
    setUploadSuccess(false);
    
    try {
      // Convertir dataURL a Blob para enviar al servidor
      const base64Data = resultImageSrc.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      // Crear FormData para enviar al servidor
      const formData = new FormData();
      formData.append('image', blob, `recorte-${originalFile.name}`);
      
      // Enviar al servidor
      const response = await axios.post('http://localhost:3000/api/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
      
      // Actualizar estado con la respuesta del servidor
      setUploadSuccess(true);
      setUploadedImageUrl(response.data.url);
      console.log('Imagen guardada exitosamente:', response.data);
    } catch (error) {
      console.error('Error al guardar la imagen:', error);
      setUploadError(`Error al guardar la imagen: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (cropper) {
        cropper.destroy();
      }
    };
  }, [cropper]);
  
  return (
    <div className="container" style={{
      backgroundColor: '#ffffff',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      maxWidth: '800px',
      width: '100%',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#1a73e8', marginTop: 0 }}>Recortador de Imágenes con Metadatos</h1>
      
      {/* SECCIÓN DE ENTRADA */}
      <div className="input-section" style={{
        border: '1px dashed #d0d0d0',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>1. Sube tu imagen</h2>
        <label htmlFor="imageInput" className="custom-file-upload" style={{
          border: '1px solid #ccc',
          display: 'inline-block',
          padding: '10px 20px',
          cursor: 'pointer',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px',
          fontWeight: 'bold',
          transition: 'background-color 0.3s',
          color: '#000',
        }}>Seleccionar Imagen</label>
        <input 
          type="file" 
          id="imageInput" 
          ref={imageInputRef}
          accept="image/*" 
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        {showOriginalDetails && (
          <div className="image-details" style={{
            textAlign: 'left',
            backgroundColor: '#f9f9f9',
            border: '1px solid #eee',
            padding: '15px',
            borderRadius: '5px',
            marginTop: '15px',
            fontSize: '14px'
          }}>
            <p><strong style={{ minWidth: '100px', display: 'inline-block', color: '#000' }}>Nombre:</strong> <span style={{ color: '#000' }}>{originalDetails.name}</span></p>
            <p><strong style={{ minWidth: '100px', display: 'inline-block', color: '#000' }}>Dimensiones:</strong> <span style={{ color: '#000' }}>{originalDetails.dimensions}</span></p>
            <p><strong style={{ minWidth: '100px', display: 'inline-block', color: '#000' }}>Peso:</strong> <span style={{ color: '#000' }}>{originalDetails.size}</span></p>
            <p><strong style={{ minWidth: '100px', display: 'inline-block', color: '#000' }}>Tipo:</strong> <span style={{ color: '#000' }}>{originalDetails.type}</span></p>
          </div>
        )}
        
        <div 
          className="cropper-container" 
          ref={cropperContainerRef}
          style={{ 
            display: showCropperContainer ? 'block' : 'none',
            margin: '20px auto',
            maxWidth: '100%',
            height: '450px',
            backgroundColor: '#e9ecef',
            color: '#000  '
          }}
        >
          <img 
            ref={imageToCropRef} 
            id="imageToCrop" 
            style={{
              display: 'block',
              maxWidth: '100%'
            }}
          />
        </div>
        
        {showCropButton && (
          <button 
            id="cropButton" 
            onClick={handleCrop}
            style={{ 
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px',
              color: '#000',
              transition: 'background-color 0.3s'
            }}
          >
            Recortar Imagen
          </button>
        )}
      </div>
      
      {/* SECCIÓN DE RESULTADO */}
      <div 
        className="result-section" 
        ref={resultSectionRef}
        style={{ 
          display: showResultSection ? 'block' : 'none',
          border: '1px dashed #d0d0d0',
          padding: '20px',
          borderRadius: '8px',
          color: '#000',
          marginTop: '20px'
        }}
      >
        <h2>2. Resultado</h2>
        <div 
          className="result-container"
          ref={resultContainerRef}
          style={{ textAlign: 'center' }}
        >
          {resultImageSrc && (
            <img 
              src={resultImageSrc} 
              alt="Imagen recortada" 
              style={{
                maxWidth: '100%',
                marginTop: '15px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                color: '#000',
                padding: '5px'
              }}
            />
          )}
        </div>
        
        <div className="image-details" style={{
          textAlign: 'left',
          backgroundColor: '#f9f9f9',
          border: '1px solid #eee',
          padding: '15px',
          borderRadius: '5px',
          marginTop: '15px',  
          fontSize: '14px',
          color: '#000',
        }}>
          <p><strong style={{ minWidth: '100px', display: 'inline-block' }}>Nombre:</strong> <span>{resultDetails.name}</span></p>
          <p><strong style={{ minWidth: '100px', display: 'inline-block' }}>Dimensiones:</strong> <span>{resultDetails.dimensions}</span></p>
          <p><strong style={{ minWidth: '100px', display: 'inline-block' }}>Peso:</strong> <span>{resultDetails.size}</span></p>
          <p><strong style={{ minWidth: '100px', display: 'inline-block' }}>Tipo:</strong> <span>{resultDetails.type}</span></p>
        </div>
        
        {/* Botón para guardar en el servidor */}
        <button 
          onClick={handleSaveImage}
          disabled={isUploading}
          style={{ 
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 25px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px',
            transition: 'background-color 0.3s'
          }}
        >
          {isUploading ? 'Guardando...' : 'Guardar en Servidor'}
        </button>
        
        {/* Barra de progreso */}
        {isUploading && (
          <div style={{ 
            marginTop: '15px',
            backgroundColor: '#e9ecef',
            borderRadius: '5px',
            height: '20px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${uploadProgress}%`,
              backgroundColor: '#007bff',
              height: '100%',
              textAlign: 'center',
              lineHeight: '20px',
              color: 'white',
              transition: 'width 0.3s ease'
            }}>
              {uploadProgress}%
            </div>
          </div>
        )}
        
        {/* Mensaje de éxito */}
        {uploadSuccess && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '5px',
            border: '1px solid #c3e6cb'
          }}>
            <p>¡Imagen guardada exitosamente!</p>
            {uploadedImageUrl && (
              <a 
                href={uploadedImageUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  color: '#007bff',
                  textDecoration: 'underline'
                }}
              >
                Ver imagen en el servidor
              </a>
            )}
          </div>
        )}
        
        {/* Mensaje de error */}
        {uploadError && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '5px',
            border: '1px solid #f5c6cb'
          }}>
            <p>{uploadError}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;