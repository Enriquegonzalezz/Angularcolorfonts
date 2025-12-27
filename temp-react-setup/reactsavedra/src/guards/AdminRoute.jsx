import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

/**
 * Componente de ruta protegida para administradores
 * Verifica si el usuario está autenticado y es administrador
 * Si no cumple con los requisitos, redirige al login
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  // Verificar si el usuario está autenticado y es administrador
  if (isAuthenticated() && isAdmin()) {
    return children;
  }
  
  // Si no es administrador, redirigir al login
  return <Navigate to="/login" replace />;
};

export default AdminRoute;
