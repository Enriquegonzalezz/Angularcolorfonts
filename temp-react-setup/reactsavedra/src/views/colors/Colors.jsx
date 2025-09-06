import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../services/AuthContext';
import './Colors.css';

// Definición de tipos
const initialColors = ['#000000', '#FFFFFF', '#F596D3', '#D247BF', '#61DAFB'];

const Colors = () => {
  const [colors, setColors] = useState(initialColors);
  const [savedColors, setSavedColors] = useState([]);
  const [defaultColorId, setDefaultColorId] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchColors();
  }, []);

  // Verificar autenticación
  const checkAuth = () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return false;
    }
    return true;
  };

  // Obtener colores guardados
  const fetchColors = () => {
    if (!checkAuth()) return;

    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    axios.get('http://localhost:3000/colors', { headers })
      .then(response => {
        setSavedColors(response.data);
        // Encontrar el color predeterminado
        const defaultColor = response.data.find(color => color.is_default || color.predeterminado === 1);
        if (defaultColor) {
          setDefaultColorId(defaultColor.id);
        }
      })
      .catch(error => {
        console.error('Error al obtener los colores:', error);
        navigate('/login');
      });
  };

  // Manejar cambio de color
  const handleColorChange = (index, value) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
  };

  // Validar paleta de colores
  const isValidColorPalette = () => {
    const isValid = colors.every(color => color.length === 7);
    console.log('Validando paleta:', colors, 'isValid:', isValid);
    return isValid;
  };

  // Guardar selección de colores
  const handleSave = () => {
    if (!checkAuth()) return;

    console.log('Botón de guardar presionado');
    console.log('Colores actuales:', colors);
    console.log('¿Es válida la paleta?', isValidColorPalette());
    
    // Verificar si hay colores vacíos o inválidos
    if (colors.some(color => !color || color.length !== 7)) {
      console.error('Hay colores vacíos o inválidos');
      alert('Por favor, asegúrate de que todos los colores estén seleccionados correctamente');
      return;
    }
    
    if (!isValidColorPalette()) {
      console.error('La paleta de colores no es válida');
      alert('La paleta de colores no es válida. Asegúrate de que todos los colores tengan un formato hexadecimal válido (ej: #RRGGBB)');
      return;
    }

    const colorData = {
      color_1: colors[0],
      color_2: colors[1],
      color_3: colors[2],
      color_4: colors[3],
      color_5: colors[4]
    };

    console.log('Enviando datos al servidor:', colorData);

    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    axios.post('http://localhost:3000/colors/store', colorData, { headers })
      .then(response => {
        console.log('Respuesta del servidor:', response.data);
        console.log('Datos guardados exitosamente');
        fetchColors();
        resetForm();
      })
      .catch(error => {
        console.error('Error al guardar los colores:', error);
        if (error.code === 'ERR_NETWORK') {
          console.error('No se pudo conectar al servidor. ¿Está ejecutando el servidor backend en http://localhost:3000?');
        }
        navigate('/login');
      });
  };

  // Actualizar colores
  const handleUpdate = () => {
    if (editRow === null) return;
    if (!checkAuth()) return;

    const colorId = savedColors[editRow].id;
    const colorData = {
      color_1: colors[0],
      color_2: colors[1],
      color_3: colors[2],
      color_4: colors[3],
      color_5: colors[4]
    };

    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    axios.put(`http://localhost:3000/colors/update/${colorId}`, colorData, { headers })
      .then(() => {
        fetchColors();
        setEditRow(null);
        resetForm();
      })
      .catch(error => {
        console.error('Error al actualizar los colores:', error);
        navigate('/login');
      });
  };

  // Eliminar color
  const handleDelete = (colorId) => {
    if (!checkAuth()) return;

    // Si se elimina el color predeterminado, limpiar defaultColorId
    if (defaultColorId === colorId) {
      setDefaultColorId(null);
    }

    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    axios.delete(`http://localhost:3000/colors/delete/${colorId}`, { headers })
      .then(() => {
        setSavedColors(savedColors.filter(row => row.id !== colorId));
      })
      .catch(error => {
        console.error('Error al eliminar el color:', error);
        navigate('/login');
      });
  };

  // Editar fila
  const handleEdit = (rowIdx) => {
    setEditRow(rowIdx);
    const row = savedColors[rowIdx];
    setColors([row.color_1, row.color_2, row.color_3, row.color_4, row.color_5]);

    // Establecer color predeterminado si este era el predeterminado
    if (row.is_default || row.predeterminado === 1) {
      setDefaultColorId(row.id);
    }
  };

  // Establecer color predeterminado
  const handleToggleDefault = (colorId) => {
    if (!checkAuth()) return;

    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };
    
    axios.put(`http://localhost:3000/colors/update/predeterminado/${colorId}`, {}, { headers })
      .then(() => {
        console.log('Predeterminado actualizado exitosamente');
        fetchColors(); // Refrescar la lista
      })
      .catch(error => {
        console.error('Error al actualizar el predeterminado:', error);
        navigate('/login');
      });
  };

  // Resetear formulario
  const resetForm = () => {
    console.log('Reseteando formulario...');
    setEditRow(null);
    setColors(initialColors);
    console.log('Formulario reseteado. Colores:', initialColors);
  };

  // Navegar a la página de fuentes
  const goToFonts = () => {
    navigate('/fonts');
  };

  // Regresar al home
  const goToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-xl shadow-sm border p-6 md:p-8">
          <h1 className="text-2xl font-semibold text-green-400 text-center mb-6">
            Selecciona tus colores
          </h1>
          <div className="flex flex-col lg:flex-row gap-8 margin-x-auto justify-between">
            {/* Colores */}
            <div className="flex-1 gap-6">
              <div className="mt-6 w-full flex flex-col items-center">
                {colors.map((color, i) => (
                  <div key={i} className="flex items-center space-x-4 mb-4">
                    <label htmlFor={`color-${i}`} className="text-gray-200 font-medium">
                      Color {i + 1}:
                    </label>
                    <input
                      type="color"
                      id={`color-${i}`}
                      name={`color_${i + 1}`}
                      value={color}
                      onChange={(e) => handleColorChange(i, e.target.value)}
                      className="w-8 h-8 rounded-full shadow-inner border-2 border-green-500 bg-[#23272e] cursor-pointer"
                    />
                    <span className="text-gray-300 font-mono">{color}</span>
                  </div>
                ))}
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
                    onClick={goToFonts}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Ir a Fuentes
                  </button>
                </div>
              </div>
            </div>
            {/* HeroCard Preview con estructura igual a HeroCards */}
            <div className="flex-1 flex flex-col items-center w-full mt-8 lg:mt-0 border-2 border-radius-lg p-3">
              <div
                className="border-radius-lg p-3 max-w-[340px] rounded-2xl border-4 shadow-lg p-0 mx-auto transition-all"
                style={{
                  background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
                  color: colors[2],
                  borderColor: colors[3],
                  boxShadow: `0 0 20px 2px ${colors[4]}55`
                }}
              >
                <div className="flex flex-row items-center gap-4 p-6 pb-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm">
                    <div 
                      style={{ background: colors[1], color: colors[2] }} 
                      className="w-full h-full rounded-full flex items-center justify-center"
                    >
                      EG
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg" style={{ color: colors[2] }}>Enrique Gonzalez</span>
                    <span className="text-sm" style={{ color: colors[2] }}>&#64;kikegonza</span>
                  </div>
                </div>
                <div className="px-6 pb-4" style={{ color: colors[2] }}>
                  Funciona perfecto!
                </div>
                <div className="px-6 pb-4 flex flex-col items-start">
                  <div
                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    style={{
                      background: colors[3],
                      color: colors[1],
                      borderColor: colors[4]
                    }}
                  >
                    el mas popular
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold" style={{ color: colors[2] }}>$0</span>
                    <span className="ml-2 text-muted-foreground" style={{ color: colors[2] }}> /month</span>
                  </div>
                  <div className="mt-2 text-sm" style={{ color: colors[2] }}>
                    Lorem ipsum dolor sit, amet ipsum consectetur adipisicing elit.
                  </div>
                </div>
                <div className="px-6 pb-4">
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full"
                    style={{
                      background: colors[3],
                      color: colors[1],
                      borderColor: colors[4],
                      border: `2px solid ${colors[4]}`
                    }}
                  >
                    Empezar prueba ahora
                  </button>
                </div>
                <hr className="w-4/5 m-auto mb-4" style={{ borderColor: colors[4] }} />
                <div className="px-6 pb-6">
                  <div className="space-y-2">
                    {['4 Team member', '4 GB Storage', 'Upto 6 pages'].map((benefit, index) => (
                      <div key={index} className="flex items-center text-sm" style={{ color: colors[2] }}>
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{ background: colors[4] }}
                        ></span>
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Saved Colors Table */}
      <div className="container mx-auto px-4 mt-8 mb-12">
        <div className="bg-card rounded-xl shadow-sm border p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Tus selecciones</h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {[0, 1, 2, 3, 4].map(i => (
                    <th key={i} className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Color {i + 1}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Predeterminado</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {savedColors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No hay selecciones guardadas.
                    </td>
                  </tr>
                ) : (
                  savedColors.map((row, rowIdx) => (
                    <tr key={row.id} className="hover:bg-muted/50">
                      {[row.color_1, row.color_2, row.color_3, row.color_4, row.color_5].map((color, i) => (
                        <td key={i} className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-5 w-5 rounded-full border-2 border-border"
                              style={{ background: color }}
                              title={color}
                            ></span>
                            <span className="text-muted-foreground font-mono text-xs">{color}</span>
                          </div>
                        </td>
                      ))}
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

export default Colors;
