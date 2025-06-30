import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface User {
  id: number;
  username: string;
  email: string;
  admin: number; // 0 = Usuario, 1 = Admin
  estado: string; // 'F' = Habilitado, 'V' = Deshabilitado
  first_name?: string; // Opcional porque puede ser null
}

interface UserDetails {
  id: number;
  username: string;
  email: string;
  admin: number;
  estado: string;
  first_name: string;
  last_name?: string;
  maiden_name?: string;
  age?: number;
  gender?: string;
  phone?: string;
  birth_date?: string;
  image_url?: string;
  blood_group?: string;
  height_cm?: number;
  weight_kg?: number;
  eye_color?: string;
  ip_address?: string;
  mac_address?: string;
  university?: string;
  ein?: string;
  ssn?: string;
  user_agent?: string;
  cabellos?: {
    color?: string;
    type?: string;
  };
  direcciones?: Array<{
    address_line?: string;
    city?: string;
    state?: string;
    state_code?: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
    country?: string;
    type?: string;
  }>;
  informacion_bancaria?: {
    card_expire?: string;
    card_number?: string;
    card_type?: string;
    currency?: string;
    iban?: string;
  };
  informacion_compania?: {
    department?: string;
    company_name?: string;
    title?: string;
    address_line?: string;
    city?: string;
    state?: string;
    state_code?: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
    country?: string;
  };
  criptomonedas?: Array<{
    coin?: string;
    wallet?: string;
    network?: string;
  }>;
}

@Component({
  selector: 'app-datatable-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './datatable-view.html',
  styleUrl: './datatable-view.css'
})
export class DatatableView implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: UserDetails | null = null;
  showUserDetails = false;
  searchTerm = '';
  isLoading = false;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  isLoadingDetails = false;

  // Hacer Math disponible en el template
  Math = Math;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.isLoading = true;
    const token = localStorage.getItem('access_token');

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<User[]>('http://localhost:3000/usersInfo', { headers })
      .subscribe({
        next: (data) => {
          console.log('Datos recibidos del backend:', data);
          console.log('Primer usuario como ejemplo:', data[0]);
          this.users = data;
          this.filteredUsers = [...this.users];
          this.calculateTotalPages();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching users:', error);
          this.isLoading = false;
          if (error.status === 401) {
            this.router.navigate(['/login']);
          }
        }
      });
  }

  filterUsers() {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.users];
    } else {
      const searchTermLower = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(user => {
        const username = user.username?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';
        const firstName = user.first_name?.toLowerCase() || '';
        
        return username.includes(searchTermLower) ||
               email.includes(searchTermLower) ||
               firstName.includes(searchTermLower);
      });
    }
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  showDetails(user: User) {
    this.isLoadingDetails = true;
    this.showUserDetails = true;
    this.selectedUser = null;
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<UserDetails>(`http://localhost:3000/userInfo/${user.id}`, { headers })
      .subscribe({
        next: (userDetails) => {
          console.log('Detalles del usuario recibidos:', userDetails);
          this.selectedUser = userDetails;
          this.isLoadingDetails = false;
        },
        error: (error) => {
          console.error('Error fetching user details:', error);
          this.isLoadingDetails = false;
          if (error.status === 401) {
            this.router.navigate(['/login']);
          }
        }
      });
  }

  closeDetails() {
    this.selectedUser = null;
    this.showUserDetails = false;
    this.isLoadingDetails = false;
  }

  exportToPDF() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const centerX = pageWidth / 2;

    // Configurar colores del tema
    const primaryColor: [number, number, number] = [16, 185, 129]; // Verde
    const secondaryColor: [number, number, number] = [55, 65, 81]; // Gris oscuro
    const lightGray: [number, number, number] = [245, 245, 245];

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
    const totalUsers = this.filteredUsers.length;
    const activeUsers = this.filteredUsers.filter(u => u.estado === 'F').length;
    const adminUsers = this.filteredUsers.filter(u => u.admin === 1).length;

    doc.text(`Total de usuarios: ${totalUsers} | Activos: ${activeUsers} `, 
      centerX, logoY + 50, { align: 'center' });

    // Tabla de usuarios mejorada
    const tableData = this.filteredUsers.map(user => [
      user.id.toString(),
      user.username,
      user.email,
      user.admin === 1 ? 'Admin' : 'Usuario',
      user.estado === 'F' ? 'Habilitado' : 'Deshabilitado',
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
      didDrawPage: function(data: any) {
        // Agregar pie de página
        const pageCount = (doc as any).internal.getNumberOfPages();
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
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    if (finalY < pageHeight - 30) {
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('Este reporte fue generado automáticamente por el sistema de gestión de usuarios.', 
        centerX, finalY, { align: 'center' });
    }

    doc.save(`usuarios-reporte-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  exportToExcel() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredUsers.map(user => ({
      ID: user.id,
      Usuario: user.username,
      Email: user.email,
      Rol: user.admin === 1 ? 'Admin' : 'Usuario',
      Estado: user.estado === 'F' ? 'Habilitado' : 'Deshabilitado',
      'Primer Nombre': user.first_name
    })));

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

    XLSX.writeFile(workbook, 'usuarios-reporte.xlsx');
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  toggleUserStatus(user: User) {
    console.log('toggleUserStatus llamado para usuario:', user);
    console.log('Estado actual:', user.estado);
    
    const newEstado = user.estado === 'F' ? 'V' : 'F';
    console.log('Nuevo estado a enviar:', newEstado);
    
    const token = localStorage.getItem('access_token');
    console.log('Token encontrado:', !!token);

    if (!token) {
      console.log('No hay token, redirigiendo a login');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log('Headers preparados:', headers);

    console.log('Enviando request a:', `http://localhost:3000/cambiarEstado/${user.id}`);
    console.log('Body del request:', { estado: newEstado });

    this.http.patch<User>(`http://localhost:3000/cambiarEstado/${user.id}`,
      { estado: newEstado },
      { headers }
    ).subscribe({
      next: (updatedUser) => {
        console.log('Respuesta exitosa del backend:', updatedUser);
        // Actualizar el usuario en la lista local
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index] = { ...this.users[index], estado: newEstado };
          this.filterUsers(); // Re-filtrar para actualizar la vista
          console.log('Usuario actualizado en la lista local');
        }
        console.log(`Usuario ${user.username} ${newEstado === 'F' ? 'habilitado' : 'deshabilitado'}`);
      },
      error: (error) => {
        console.error('Error completo:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error response:', error.error);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  isUserActive(user: User): boolean {
    return user.estado === 'F';
  }

  getUserStatusText(user: User): string {
    return this.isUserActive(user) ? 'Habilitado' : 'Deshabilitado';
  }

  getUserStatusClass(user: User): string {
    return this.isUserActive(user)
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  }

  getUserRoleText(user: User): string {
    return user.admin === 1 ? 'Admin' : 'Usuario';
  }

  getUserRoleClass(user: User): string {
    return user.admin === 1
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';
  }
}
