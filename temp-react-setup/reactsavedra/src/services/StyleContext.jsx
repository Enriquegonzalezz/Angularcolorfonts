import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Definición de tipos
export const Sizes = {
  title: 48,
  subtitle: 32,
  paragraph: 18,
};

// Crear el contexto de estilos
const StyleContext = createContext();

// Hook personalizado para usar el contexto de estilos
export const useStyles = () => {
  return useContext(StyleContext);
};

// Proveedor del contexto de estilos
export const StyleProvider = ({ children }) => {
  // Valores por defecto
  const defaultColors = ['#000000', '#FFFFFF', '#F596D3', '#D247BF', '#61DAFB'];
  const defaultFonts = [
    'http://localhost:3000/public/fonts/Altone-Trial-Oblique.ttf',
    'http://localhost:3000/public/fonts/Neka-Laurent.ttf'
  ];
  const defaultSizes = {
    title: 48,
    subtitle: 32,
    paragraph: 18,
  };

  // Estados
  const [colors, setColors] = useState(defaultColors);
  const [fonts, setFonts] = useState(defaultFonts);
  const [sizes, setSizes] = useState(defaultSizes);
  const [loading, setLoading] = useState(true);

  // Cargar estilos al iniciar
  useEffect(() => {
    console.log('StyleContext inicializado');
    //testBackendConnection();
    loadDefaultStyles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Probar conexión con el backend
  /*const testBackendConnection = () => {
    console.log('Probando conexión con el backend...');
    
    // Probar conexión básica
    axios.get('http://localhost:3000/health', { responseType: 'text' })
      .then(response => {
        console.log('✅ Backend conectado:', response.data);
      })
      .catch(error => {
        console.log('❌ Error conectando al backend:', error);
        console.log('Intentando conectar sin endpoint específico...');
        
        // Intentar con un endpoint que sabemos que existe
        axios.get('http://localhost:3000/colors/predeterminado')
          .then(response => {
            console.log('✅ Endpoint de colores accesible:', response.data);
          })
          .catch(err => {
            console.log('❌ Endpoint de colores no accesible:', err);
          });
      });
  };*/

  // Cargar estilos por defecto
  const loadDefaultStyles = () => {
    console.log('Cargando estilos por defecto...');
    fetchDefaultColors();
    fetchDefaultFonts();
    setLoading(false);
  };

  // Obtener colores del backend
  const fetchDefaultColors = () => {
    console.log('Intentando obtener colores del backend...');
    
    // Intentar con token si existe
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    if (token) {
      console.log('Usando token para obtener colores');
    } else {
      console.log('No hay token, intentando sin autenticación');
    }

    axios.get('http://localhost:3000/colors/predeterminado', { headers })
      .then(response => {
        const data = response.data;
        console.log('Colores obtenidos del backend:', data);
        if (data) {
          const newColors = [
            data.color_1,
            data.color_2,
            data.color_3,
            data.color_4,
            data.color_5,
          ];
          console.log('Aplicando colores:', newColors);
          setColors(newColors);
        }
      })
      .catch(error => {
        console.error('Error al obtener los colores:', error);
        console.log('Usando colores por defecto');
      });
  };

  // Obtener fuentes del backend
  const fetchDefaultFonts = () => {
    console.log('Intentando obtener fuentes del backend...');
    
    // Intentar con token si existe
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    if (token) {
      console.log('Usando token para obtener fuentes');
    } else {
      console.log('No hay token, intentando sin autenticación');
    }

    axios.get('http://localhost:3000/fonts/predeterminado', { headers })
      .then(response => {
        const data = response.data;
        console.log('Fuentes obtenidas del backend:', data);
        if (data) {
          const newFonts = [
            `http://localhost:3000/public/fonts/${data.fuente_1}`,
            `http://localhost:3000/public/fonts/${data.fuente_2}`,
          ];
          console.log('Aplicando fuentes:', newFonts);
          setFonts(newFonts);
          
          const newSizes = {
            paragraph: data.tamano_1,
            subtitle: data.tamano_2,
            title: data.tamano_3,
          };
          console.log('Aplicando tamaños:', newSizes);
          setSizes(newSizes);
          
          loadFonts(newFonts);
        }
      })
      .catch(error => {
        console.error('Error al obtener las fuentes y tamaños:', error);
        console.log('Usando fuentes y tamaños por defecto');
        // Cargar fuentes por defecto
        loadFonts(defaultFonts);
      });
  };

  // Cargar fuentes en el documento
  const loadFonts = (fontUrls) => {
    console.log('Cargando fuentes:', fontUrls);
    if (fontUrls[0]) {
      const font1 = new FontFace('CustomFont1', `url(${fontUrls[0]})`);
      font1.load().then((loaded) => {
        document.fonts.add(loaded);
        console.log('Fuente CustomFont1 cargada');
      }).catch(error => {
        console.error('Error cargando CustomFont1:', error);
      });
    }
    if (fontUrls[1]) {
      const font2 = new FontFace('CustomFont2', `url(${fontUrls[1]})`);
      font2.load().then((loaded) => {
        document.fonts.add(loaded);
        console.log('Fuente CustomFont2 cargada');
      }).catch(error => {
        console.error('Error cargando CustomFont2:', error);
      });
    }
  };

  // Valor del contexto
  const value = {
    colors,
    fonts,
    sizes,
    loading,
    fetchDefaultColors,
    fetchDefaultFonts
  };

  return (
    <StyleContext.Provider value={value}>
      {!loading && children}
    </StyleContext.Provider>
  );
};

export default StyleContext;
