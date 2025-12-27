import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({
          id: payload.id,
          email: payload.email,
          admin: payload.admin === 1
        });
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        localStorage.removeItem('access_token');
      }
    }
    setLoading(false);
  }, []);

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    return !!token;
  };

  // Verificar si el usuario es administrador
  const isAdmin = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.admin === 1;
    } catch (error) {
      console.error('Error al verificar rol de administrador:', error);
      return false;
    }
  };

  // Obtener ID del usuario
  const getUserId = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (error) {
      console.error('Error al obtener ID del usuario:', error);
      return null;
    }
  };

  // Obtener email del usuario
  const getUserEmail = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email;
    } catch (error) {
      console.error('Error al obtener email del usuario:', error);
      return null;
    }
  };

  // Cerrar sesión
  const logout = () => {
    localStorage.removeItem('access_token');
    setCurrentUser(null);
  };

  // Login (función que se implementará cuando se migre el componente de login)
  const login = (token) => {
    localStorage.setItem('access_token', token);
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUser({
        id: payload.id,
        email: payload.email,
        admin: payload.admin === 1
      });
      return true;
    } catch (error) {
      console.error('Error al procesar token de autenticación:', error);
      localStorage.removeItem('access_token');
      return false;
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    isAdmin,
    getUserId,
    getUserEmail,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
