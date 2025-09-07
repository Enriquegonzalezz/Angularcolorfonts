import Swal from "sweetalert2";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../services/AuthContext';
import { useStyles } from '../../services/StyleContext';
import './Fonts.css';

const Fonts = () => {
  const { fetchDefaultColors, fetchDefaultFonts } = useStyles();
  const [fontFiles, setFontFiles] = useState([null, null]);
  const [fontUrls, setFontUrls] = useState([null, null]);
  const [sizes, setSizes] = useState({ paragraph: 16, subtitle: 24, title: 32 });
  const [savedFonts, setSavedFonts] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [defaultFontId, setDefaultFontId] = useState(null);
  const FONT_BASE_URL = 'http://localhost:3000/public/fonts/';
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchFonts();
    return () => {
      cleanupFontStyles();
    };
  }, []);

  const checkAuth = () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return false;
    }
    return true;
  };

  const fetchFonts = () => {
    if (!checkAuth()) return;

    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    axios.get('http://localhost:3000/fonts', { headers })
      .then(response => {
        setSavedFonts(response.data);
        const defaultFont = response.data.find(font => font.is_default || font.predeterminado === 1);
        if (defaultFont) {
          setDefaultFontId(defaultFont.id);
        }
      })
      .catch(error => {
        console.error('Error al obtener las fuentes:', error);
        navigate('/login');
      });
  };

  const handleFileChange = (index, event) => {
    const input = event.target;
    if (input.files && input.files[0]) {
      const newFontFiles = [...fontFiles];
      newFontFiles[index] = input.files[0];
      setFontFiles(newFontFiles);
      updateFontPreview(index, input.files[0]);
    }
  };

  const updateFontPreview = (index, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newFontUrls = [...fontUrls];
      newFontUrls[index] = e.target.result;
      setFontUrls(newFontUrls);
      
      const fontName = `Font${index + 1}`;
      const styleId = `font-style-${index}`;
      let styleElement = document.getElementById(styleId);
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      
      styleElement.textContent = `
        @font-face {
          font-family: '${fontName}';
          src: url('${e.target.result}') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
      `;
    };
    reader.readAsDataURL(file);
  };

  const handleSizeChange = (type, value) => {
    setSizes(prevSizes => ({
      ...prevSizes,
      [type]: value
    }));
  };

  // Guardar fuentes (con SweetAlerts)
  const handleSave = async () => {
    if (!checkAuth()) return;
    
    if (!fontFiles[0] || !fontFiles[1]) {
      Swal.fire({
        icon: 'warning',
        title: '¡Faltan fuentes!',
        text: 'Por favor, selecciona ambas fuentes para continuar.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('fuente_1', fontFiles[0]);
    formData.append('fuente_2', fontFiles[1]);
    formData.append('tamano_1', sizes.paragraph);
    formData.append('tamano_2', sizes.subtitle);
    formData.append('tamano_3', sizes.title);

    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.post('http://localhost:3000/fonts/store', formData, { 
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'Las fuentes se han guardado exitosamente.',
        confirmButtonText: 'Aceptar'
      });
      fetchFonts();
      resetForm();
    } catch (error) {
      console.error('Error al guardar las fuentes:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al guardar las fuentes.',
      });
      navigate('/login');
    }
  };

  // Actualizar fuentes (con SweetAlerts)
  const handleUpdate = async () => {
    if (editRow === null) return;
    if (!checkAuth()) return;

    const fontId = savedFonts[editRow].id;
    const formData = new FormData();
    
    if (fontFiles[0]) {
      formData.append('fuente_1', fontFiles[0]);
    }
    
    if (fontFiles[1]) {
      formData.append('fuente_2', fontFiles[1]);
    }
    
    formData.append('tamano_1', sizes.paragraph);
    formData.append('tamano_2', sizes.subtitle);
    formData.append('tamano_3', sizes.title);

    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.post(`http://localhost:3000/fonts/update/${fontId}`, formData, { 
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: 'Las fuentes se han actualizado exitosamente.',
        confirmButtonText: 'Aceptar'
      });
      fetchFonts();
      setEditRow(null);
      resetForm();
    } catch (error) {
      console.error('Error al actualizar las fuentes:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al actualizar las fuentes.',
      });
      navigate('/login');
    }
  };

  // Eliminar fuente (con SweetAlerts y confirmación)
  const handleDelete = (fontId) => {
    if (!checkAuth()) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };
        
        try {
          await axios.delete(`http://localhost:3000/fonts/delete/${fontId}`, { headers });
          Swal.fire(
            '¡Eliminado!',
            'La fuente ha sido eliminada.',
            'success'
          );
          setSavedFonts(savedFonts.filter(row => row.id !== fontId));
          if (defaultFontId === fontId) {
            setDefaultFontId(null);
          }
        } catch (error) {
          console.error('Error al eliminar la fuente:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al eliminar la fuente.',
          });
          navigate('/login');
        }
      }
    });
  };

  // Establecer fuente predeterminada (con SweetAlerts)
  const handleToggleDefault = async (fontId) => {
    //if (!checkAuth()) return;
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`http://localhost:3000/fonts/update/predeterminado/${fontId}`, {}, { headers });
      Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: 'La fuente predeterminada ha sido actualizada.',
        showConfirmButton: false,
        timer: 1500
      });
      await fetchDefaultFonts();
      await fetchDefaultColors();
      fetchFonts();
    } catch (error) {
      console.error('Error al actualizar el predeterminado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al establecer la fuente como predeterminada.',
      });
      navigate('/login');
    }
  };

  const handleEdit = (rowIdx) => {
    setEditRow(rowIdx);
    const row = savedFonts[rowIdx];
    setSizes({
      paragraph: row.tamano_1,
      subtitle: row.tamano_2,
      title: row.tamano_3
    });
    setFontUrls([
      row.fuente_1 ? `${FONT_BASE_URL}${row.fuente_1}` : null,
      row.fuente_2 ? `${FONT_BASE_URL}${row.fuente_2}` : null
    ]);
    if (row.fuente_1) {
      const styleElement = document.createElement('style');
      styleElement.id = 'font-style-0';
      styleElement.textContent = `
        @font-face {
          font-family: 'Font1';
          src: url('${FONT_BASE_URL}${row.fuente_1}') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
      `;
      document.head.appendChild(styleElement);
    }
    if (row.fuente_2) {
      const styleElement = document.createElement('style');
      styleElement.id = 'font-style-1';
      styleElement.textContent = `
        @font-face {
          font-family: 'Font2';
          src: url('${FONT_BASE_URL}${row.fuente_2}') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
      `;
      document.head.appendChild(styleElement);
    }
    if (row.is_default || row.predeterminado === 1) {
      setDefaultFontId(row.id);
    }
  };

  const resetForm = () => {
    setFontFiles([null, null]);
    setFontUrls([null, null]);
    setSizes({ paragraph: 16, subtitle: 24, title: 32 });
    setEditRow(null);
    cleanupFontStyles();
  };

  const cleanupFontStyles = () => {
    const styleElement1 = document.getElementById('font-style-0');
    const styleElement2 = document.getElementById('font-style-1');
    
    if (styleElement1) {
      document.head.removeChild(styleElement1);
    }
    
    if (styleElement2) {
      document.head.removeChild(styleElement2);
    }
  };

  const goToColors = () => {
    navigate('/colors');
  };

  const goToHome = () => {
    navigate('/');
  };

  const getFontFamily1 = () => {
    return fontUrls[0] ? "'Font1', sans-serif" : "sans-serif";
  };

  const getFontFamily2 = () => {
    return fontUrls[1] ? "'Font2', serif" : "serif";
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-xl shadow-sm border p-6 md:p-8">
          <h1 className="text-2xl font-semibold text-green-400 text-center mb-6">
            Selecciona tus fuentes
          </h1>
          <div className="flex flex-col lg:flex-row gap-8 margin-x-auto justify-between">
            {/* Formulario de fuentes */}
            <div className="flex-1 gap-6">
              <div className="mt-6 w-full">
                {/* Fuente 1 */}
                <div className="font-upload mb-4">
                  <label className="text-gray-200 font-medium mb-2 block">Fuente 1 (Sans-serif):</label>
                  <input
                    type="file"
                    id="font1"
                    accept=".ttf,.otf,.woff,.woff2"
                    onChange={(e) => handleFileChange(0, e)}
                    className="hidden"
                  />
                  <label htmlFor="font1" className="file-label">
                    {fontFiles[0] ? fontFiles[0].name : 'Seleccionar archivo'}
                  </label>
                </div>

                {/* Fuente 2 */}
                <div className="font-upload mb-4">
                  <label className="text-gray-200 font-medium mb-2 block">Fuente 2 (Serif):</label>
                  <input
                    type="file"
                    id="font2"
                    accept=".ttf,.otf,.woff,.woff2"
                    onChange={(e) => handleFileChange(1, e)}
                    className="hidden"
                  />
                  <label htmlFor="font2" className="file-label">
                    {fontFiles[1] ? fontFiles[1].name : 'Seleccionar archivo'}
                  </label>
                </div>

                {/* Tamaños */}
                <div className="size-slider mb-4">
                  <label className="text-gray-200 font-medium mb-2 block">Tamaño de párrafo:</label>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={sizes.paragraph}
                    onChange={(e) => handleSizeChange('paragraph', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="size-value">{sizes.paragraph}px</span>
                </div>

                <div className="size-slider mb-4">
                  <label className="text-gray-200 font-medium mb-2 block">Tamaño de subtítulo:</label>
                  <input
                    type="range"
                    min="18"
                    max="36"
                    value={sizes.subtitle}
                    onChange={(e) => handleSizeChange('subtitle', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="size-value">{sizes.subtitle}px</span>
                </div>

                <div className="size-slider mb-4">
                  <label className="text-gray-200 font-medium mb-2 block">Tamaño de título:</label>
                  <input
                    type="range"
                    min="24"
                    max="72"
                    value={sizes.title}
                    onChange={(e) => handleSizeChange('title', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="size-value">{sizes.title}px</span>
                </div>

                <div className="flex justify-between mt-8 gap-4">
                  <button
                    onClick={editRow !== null ? handleUpdate : handleSave}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    {editRow !== null ? "Actualizar" : "Guardar selección"}
                  </button>
                  <button
                    onClick={goToHome}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 rounded-md font-medium transition-colors border border-border"
                  >
                    Regresar
                  </button>
                  <button
                    onClick={goToColors}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Ir a Colores
                  </button>
                </div>
              </div>
            </div>

            {/* Vista previa de fuentes */}
            <div className="flex-1 flex flex-col w-full mt-8 lg:mt-0">
              <div className="font-preview">
                <h2 style={{ 
                  fontFamily: getFontFamily1(), 
                  fontSize: `${sizes.title}px`,
                  color: '#ffffff'
                }}>
                  Título de ejemplo
                </h2>
                <p style={{ 
                  fontFamily: getFontFamily1(), 
                  fontSize: `${sizes.subtitle}px`,
                  color: '#e5e7eb'
                }}>
                  Este es un subtítulo de muestra
                </p>
                <p style={{ 
                  fontFamily: getFontFamily2(), 
                  fontSize: `${sizes.paragraph}px`,
                  color: '#d1d5db'
                }}>
                  Este es un párrafo de ejemplo para mostrar cómo se ve la fuente seleccionada. 
                  El texto debe ser lo suficientemente largo para mostrar varias líneas y dar una 
                  buena idea de cómo se verá el contenido con esta fuente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Fonts Table */}
      <div className="container mx-auto px-4 mt-8 mb-12">
        <div className="bg-card rounded-xl shadow-sm border p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Tus selecciones</h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Fuente 1</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Fuente 2</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Párrafo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Subtítulo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Título</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Predeterminado</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {savedFonts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No hay selecciones guardadas.
                    </td>
                  </tr>
                ) : (
                  savedFonts.map((row, rowIdx) => (
                    <tr key={row.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-name">{row.fuente_1}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-name">{row.fuente_2}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-size">{row.tamano_1}px</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-size">{row.tamano_2}px</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-size">{row.tamano_3}px</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => row.predeterminado !== 1 ? handleToggleDefault(row.id) : null}
                          className={`p-1.5 rounded-md transition-colors ${
                            row.predeterminado === 1 
                              ? 'text-yellow-500 hover:bg-yellow-500/10' 
                              : 'text-muted-foreground hover:bg-accent'
                          }`}
                          title={row.predeterminado === 1 ? 'Predeterminado' : 'Establecer como predeterminado'}
                          disabled={row.predeterminado === 1}
                        >
                          <svg 
                            width="18" 
                            height="18" 
                            viewBox="0 0 24 24" 
                            fill="currentColor" 
                            stroke="currentColor" 
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={row.predeterminado === 1 ? 'fill-yellow-500' : 'fill-none'}
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(rowIdx)}
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                            title="Modificar"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Eliminar"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fonts;