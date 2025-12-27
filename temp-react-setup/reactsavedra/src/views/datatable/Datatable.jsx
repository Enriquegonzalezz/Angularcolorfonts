import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../services/AuthContext';
import TangramLoader from '../../components/tangram-loader/TangramLoader';
import './Datatable.css';
// Importar jsPDF y xlsx para exportación
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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
      return;
    }
    
    // Cargar los usuarios para cualquier usuario autenticado
    fetchUsers();
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
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const centerX = pageWidth / 2;

    // Configurar colores del tema
    const primaryColor = [16, 185, 129]; // Verde
    const secondaryColor = [55, 65, 81]; // Gris oscuro
    const lightGray = [245, 245, 245];

    // Agregar logo SVG (ícono de usuarios)
    const logoSize = 20;
    const logoY = 25;
    
    // Dibujar un círculo para el logo
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.circle(centerX, logoY, logoSize / 2, 'F');
    
    // Agregar ícono de usuarios dentro del círculo
    doc.setFillColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('Shad', centerX - 3, logoY + 2);

    // Título principal centrado
    doc.setFontSize(24);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Reporte de Usuarios', centerX, logoY + 25, { align: 'center' });

    // Línea decorativa
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(centerX - 40, logoY + 30, centerX + 40, logoY + 30);

    // Información del reporte
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, centerX, logoY + 40, { align: 'center' });

    // Estadísticas del reporte
    const totalUsers = filteredUsers.length;
    const activeUsers = filteredUsers.filter(u => u.estado === 'V').length;
    const adminUsers = filteredUsers.filter(u => u.admin === 1).length;

    doc.text(`Total de usuarios: ${totalUsers} | Activos: ${activeUsers} `, 
      centerX, logoY + 50, { align: 'center' });

    // Tabla de usuarios mejorada
    const tableData = filteredUsers.map(user => [
      user.id.toString(),
      user.username,
      user.email,
      user.admin === 1 ? 'Admin' : 'Usuario',
      user.estado === 'V' ? 'Habilitado' : 'Deshabilitado',
      user.first_name || 'N/A'
    ]);

    autoTable(doc, {
      head: [['ID', 'Usuario', 'Email', 'Rol', 'Estado', 'Primer Nombre']],
      body: tableData,
      startY: logoY + 65,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: [0, 0, 0],
        lineColor: [229, 231, 235],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: lightGray
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 }, // ID
        1: { cellWidth: 35 }, // Usuario
        2: { cellWidth: 50 }, // Email
        3: { halign: 'center', cellWidth: 25 }, // Rol
        4: { halign: 'center', cellWidth: 25 }, // Estado
        5: { cellWidth: 30 } // Primer Nombre
      },
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      didDrawPage: function(data) {
        // Agregar pie de página
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text(`Página ${data.pageNumber} de ${pageCount}`, centerX, pageHeight - 10, { align: 'center' });
        
        // Agregar línea decorativa en el pie
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setLineWidth(0.5);
        doc.line(centerX - 30, pageHeight - 15, centerX + 30, pageHeight - 15);
      }
    });

    // Agregar información adicional al final
    const finalY = doc.lastAutoTable.finalY + 10;
    if (finalY < pageHeight - 30) {
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('Este reporte fue generado automáticamente por el sistema de gestión de usuarios.', 
        centerX, finalY, { align: 'center' });
    }

    doc.save(`usuarios-reporte-${new Date().toISOString().split('T')[0]}.pdf`);
  };
  
  // Exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredUsers.map(user => ({
      ID: user.id,
      Usuario: user.username,
      Email: user.email,
      Rol: user.admin === 1 ? 'Admin' : 'Usuario',
      Estado: user.estado === 'V' ? 'Habilitado' : 'Deshabilitado',
      'Primer Nombre': user.first_name
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

    XLSX.writeFile(workbook, 'usuarios-reporte.xlsx');
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

          {/* Tabla de usuarios */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Usuario</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Rol</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Primer Nombre</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading && (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-sm text-muted-foreground">
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cargando usuarios...
                      </div>
                    </td>
                  </tr>
                )}
                {!isLoading && getPaginatedUsers().length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                )}
                {!isLoading && getPaginatedUsers().map(user => (
                  <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm">{user.id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{user.username}</td>
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUserRoleClass(user)}`}>
                        {getUserRoleText(user)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUserStatusClass(user)}`}>
                        {getUserStatusText(user)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{user.first_name}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleUserStatus(user)}
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-white text-xs font-medium transition-colors ${isUserActive(user) ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                          {isUserActive(user) ? 'Deshabilitar' : 'Habilitar'}
                        </button>
                        <button
                          onClick={() => showDetails(user)}
                          className="bg-blue-600 hover:bg-blue-700 inline-flex items-center justify-center px-3 py-1 rounded-md text-white text-xs font-medium transition-colors"
                        >
                          Detalles
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 rounded border border-input bg-background text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
                </svg>
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 rounded border border-input bg-background text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              
              {getPageNumbers().map(page => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 rounded text-sm ${currentPage === page ? 'bg-green-600 text-white' : 'border border-input bg-background'}`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 rounded border border-input bg-background text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 rounded border border-input bg-background text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de detalles del usuario */}
      {showUserDetails && (
        <div className="modal-overlay">
          <div className="modal-container">
            {/* Header */}
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
            
            <div className="modal-content">
              {/* Loading state */}
              {isLoadingDetails && (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center">
                    <svg className="animate-spin h-8 w-8 mr-3 text-green-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-lg text-muted-foreground">Cargando detalles...</span>
                  </div>
                </div>
              )}
              
              {selectedUser && !isLoadingDetails && (
                <div className="space-y-4">
                  {/* Información básica */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-green-400 border-b border-green-400 pb-1">Información Básica</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">ID</label>
                        <p className="text-foreground">{selectedUser.id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nombre Completo</label>
                        <p className="text-foreground">{selectedUser.first_name} {selectedUser.last_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nombre de Usuario</label>
                        <p className="text-foreground">{selectedUser.username}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-foreground">{selectedUser.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                        <p className="text-foreground">{selectedUser.phone || 'No disponible'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Género</label>
                        <p className="text-foreground">{selectedUser.gender || 'No especificado'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</label>
                        <p className="text-foreground">{selectedUser.birthDate || 'No disponible'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Edad</label>
                        <p className="text-foreground">{selectedUser.age || 'No disponible'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dirección */}
                  {selectedUser.address && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-green-400 border-b border-green-400 pb-1">Dirección</h3>
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Calle</label>
                          <p className="text-foreground">{selectedUser.address.address || 'No disponible'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Ciudad</label>
                          <p className="text-foreground">{selectedUser.address.city || 'No disponible'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Estado/Provincia</label>
                          <p className="text-foreground">{selectedUser.address.state || 'No disponible'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Código Postal</label>
                          <p className="text-foreground">{selectedUser.address.postalCode || 'No disponible'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">País</label>
                          <p className="text-foreground">{selectedUser.address.country || 'No disponible'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Información Técnica */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-green-400 border-b border-green-400 pb-1">Información Técnica</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Dirección MAC</label>
                        <p className="text-foreground">{selectedUser.macAddress || 'No disponible'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">User Agent</label>
                        <p className="text-foreground">{selectedUser.userAgent || 'No disponible'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Universidad</label>
                        <p className="text-foreground">{selectedUser.university || 'No disponible'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Información Bancaria */}
                  {selectedUser.bank && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-green-400 border-b border-green-400 pb-1">Información Bancaria</h3>
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Tipo de Tarjeta</label>
                          <p className="text-foreground">{selectedUser.bank.cardType || 'No disponible'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Número de Tarjeta</label>
                          <p className="text-foreground">
                            {selectedUser.bank.cardNumber ? 
                              `**** **** **** ${selectedUser.bank.cardNumber.slice(-4)}` : 
                              'No disponible'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Fecha de Expiración</label>
                          <p className="text-foreground">{selectedUser.bank.cardExpire || 'No disponible'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Moneda</label>
                          <p className="text-foreground">{selectedUser.bank.currency || 'No disponible'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">IBAN</label>
                          <p className="text-foreground">{selectedUser.bank.iban || 'No disponible'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Información de la Empresa */}
                  {selectedUser.company && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-green-400 border-b border-green-400 pb-1">Información Laboral</h3>
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Empresa</label>
                          <p className="text-foreground">{selectedUser.company.name || 'No disponible'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Departamento</label>
                          <p className="text-foreground">{selectedUser.company.department || 'No disponible'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Cargo</label>
                          <p className="text-foreground">{selectedUser.company.title || 'No disponible'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
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
