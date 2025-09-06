import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../services/AuthContext';
import TangramLoader from '../../components/tangram-loader/TangramLoader';
import './Datatable.css';
// Importar jsPDF y xlsx si es necesario
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import * as XLSX from 'xlsx';

const Datatable = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Estados
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      fetchUsers();
    }
  }, [isAuthenticated, navigate]);
  
  // Obtener usuarios
  const fetchUsers = () => {
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    const headers = { Authorization: `Bearer ${token}` };
    
    axios.get('http://localhost:3000/usersInfo', { headers })
      .then(response => {
        console.log('Datos recibidos del backend:', response.data);
        console.log('Primer usuario como ejemplo:', response.data[0]);
        setUsers(response.data);
        setFilteredUsers(response.data);
        calculateTotalPages(response.data.length);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        setIsLoading(false);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      });
  };
  
  // Filtrar usuarios
  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers([...users]);
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = users.filter(user => {
        const username = user.username?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';
        const firstName = user.first_name?.toLowerCase() || '';
        
        return username.includes(searchTermLower) ||
               email.includes(searchTermLower) ||
               firstName.includes(searchTermLower);
      });
      setFilteredUsers(filtered);
    }
    setCurrentPage(1);
    calculateTotalPages(filteredUsers.length);
  };
  
  // Calcular total de páginas
  const calculateTotalPages = (itemsCount) => {
    setTotalPages(Math.ceil(itemsCount / itemsPerPage));
  };
  
  // Obtener usuarios paginados
  const getPaginatedUsers = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  };
  
  // Mostrar detalles de usuario
  const showDetails = (user) => {
    setIsLoadingDetails(true);
    setShowUserDetails(true);
    setSelectedUser(null);
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    const headers = { Authorization: `Bearer ${token}` };
    
    axios.get(`http://localhost:3000/userInfo/${user.id}`, { headers })
      .then(response => {
        console.log('Detalles del usuario recibidos:', response.data);
        setSelectedUser(response.data);
        setIsLoadingDetails(false);
      })
      .catch(error => {
        console.error('Error fetching user details:', error);
        setIsLoadingDetails(false);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      });
  };
  
  // Cerrar detalles
  const closeDetails = () => {
    setSelectedUser(null);
    setShowUserDetails(false);
    setIsLoadingDetails(false);
  };
  
  // Exportar a PDF
  const exportToPDF = () => {
    // Implementar exportación a PDF con jsPDF
  };
  
  // Exportar a Excel
  const exportToExcel = () => {
    // Implementar exportación a Excel con xlsx
  };
  
  // Ir a página
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  // Obtener números de página
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };
  
  // Cambiar estado de usuario
  const toggleUserStatus = (user) => {
    console.log('toggleUserStatus llamado para usuario:', user);
    console.log('Estado actual:', user.estado);
    
    const newEstado = user.estado === 'V' ? 'F' : 'V';
    console.log('Nuevo estado a enviar:', newEstado);
    
    const token = localStorage.getItem('access_token');
    console.log('Token encontrado:', !!token);
    
    if (!token) {
      console.log('No hay token, redirigiendo a login');
      navigate('/login');
      return;
    }
    
    const headers = { Authorization: `Bearer ${token}` };
    console.log('Headers preparados:', headers);
    
    console.log('Enviando request a:', `http://localhost:3000/cambiarEstado/${user.id}`);
    console.log('Body del request:', { estado: newEstado });
    
    axios.patch(`http://localhost:3000/cambiarEstado/${user.id}`,
      { estado: newEstado },
      { headers }
    ).then(response => {
      console.log('Respuesta exitosa del backend:', response.data);
      // Actualizar el usuario en la lista local
      const updatedUsers = users.map(u => {
        if (u.id === user.id) {
          return { ...u, estado: newEstado };
        }
        return u;
      });
      setUsers(updatedUsers);
      filterUsers(); // Re-filtrar para actualizar la vista
    }).catch(error => {
      console.error('Error al cambiar estado:', error);
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    });
  };
  
  // Obtener clase de rol de usuario
  const getUserRoleClass = (user) => {
    return user.admin === 1 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };
  
  // Obtener texto de rol de usuario
  const getUserRoleText = (user) => {
    return user.admin === 1 ? 'Admin' : 'Usuario';
  };
  
  // Obtener clase de estado de usuario
  const getUserStatusClass = (user) => {
    return user.estado === 'V' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };
  
  // Obtener texto de estado de usuario
  const getUserStatusText = (user) => {
    return user.estado === 'V' ? 'Habilitado' : 'Deshabilitado';
  };
  
  // Verificar si el usuario está activo
  const isUserActive = (user) => {
    return user.estado === 'V';
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <TangramLoader isLoading={isLoading || isLoadingDetails} onSkip={() => {
        setIsLoading(false);
        setIsLoadingDetails(false);
      }} />
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-xl shadow-sm border p-6 md:p-8">
          <h1 className="text-2xl font-semibold text-green-400 text-center mb-6">
            Data Table de Usuarios
          </h1>

          {/* AQUÍ ES DONDE DEBES COPIAR Y PEGAR EL HTML DEL DATATABLE */}
          {/* 
            Reemplaza esta sección con el HTML del componente de Angular,
            adaptando la sintaxis de Angular a React:
            
            - Cambia *ngIf por condicionales de React: {isLoading && (...)}
            - Cambia [(ngModel)] por value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            - Cambia (input) por onChange
            - Cambia (click) por onClick
            - Cambia [class] por className con condicionales: className={`... ${condition ? 'class1' : 'class2'}`}
            - Cambia *ngFor por .map()
            - Cambia {{ variable }} por {variable}
          */}
          
          {/* Ejemplo de cómo adaptar un fragmento: */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  filterUsers();
                }}
                placeholder="Buscar usuarios..."
                className="w-full px-4 py-2 pl-10 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>

            {/* Botones de exportación */}
            <div className="flex gap-2">
              <button
                onClick={exportToPDF}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                title="Exportar a PDF"
              >
                <svg className="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                PDF
              </button>
              <button
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                title="Exportar a Excel"
              >
                <svg className="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Excel
              </button>
            </div>
          </div>
          
          {/* Aquí continúa con el resto del HTML adaptado */}
        </div>
      </div>
      
      {/* Modal de detalles del usuario */}
      {showUserDetails && (
        <div className="modal-overlay">
          <div className="modal-container">
            {/* Aquí va el contenido del modal */}
            <div className="modal-header">
              <h2 className="text-xl font-semibold text-foreground">Detalles del Usuario</h2>
              <button
                onClick={closeDetails}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {/* Aquí va el contenido del modal */}
            
            <div className="modal-footer">
              <button
                onClick={closeDetails}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Datatable;
