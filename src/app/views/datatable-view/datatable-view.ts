import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  // Agregar más campos según tu backend
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
  selectedUser: User | null = null;
  showUserDetails = false;
  searchTerm = '';
  isLoading = false;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

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

    this.http.get<User[]>('http://localhost:3000/users', { headers })
      .subscribe({
        next: (data) => {
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
      this.filteredUsers = this.users.filter(user =>
        user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
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
    this.selectedUser = user;
    this.showUserDetails = true;
  }

  closeDetails() {
    this.selectedUser = null;
    this.showUserDetails = false;
  }

  exportToPDF() {
    const doc = new jsPDF.jsPDF();

    //Agregar logo centrado en la parte superior regina
    //Nota: Necesitarás tener tu logo como base64 o URL regina
    // doc.addImage('logo-base64', 'PNG', 85, 10, 40, 20); regina

    // Título centrado
    doc.setFontSize(20);
    doc.text('Reporte de Usuarios', 105, 40, { align: 'center' });

    // Fecha del reporte
    doc.setFontSize(12);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 105, 50, { align: 'center' });

    // Tabla de usuarios
    const tableData = this.filteredUsers.map(user => [
      user.id,
      user.username,
      user.email,
      user.role || 'Usuario',
      user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'
    ]);

    (doc as any).autoTable({
      head: [['ID', 'Usuario', 'Email', 'Rol', 'Fecha Creación']],
      body: tableData,
      startY: 60,
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      headStyles: {
        fillColor: [16, 185, 129], // Verde
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    doc.save('usuarios-reporte.pdf');
  }

  exportToExcel() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredUsers.map(user => ({
      ID: user.id,
      Usuario: user.username,
      Email: user.email,
      Rol: user.role || 'Usuario',
      'Fecha Creación': user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
      'Última Actualización': user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'
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
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const token = localStorage.getItem('access_token');

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.patch<User>(`http://localhost:3000/users/${user.id}/status`,
      { status: newStatus },
      { headers }
    ).subscribe({
      next: (updatedUser) => {
        // Actualizar el usuario en la lista local
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index] = { ...this.users[index], status: newStatus };
          this.filterUsers(); // Re-filtrar para actualizar la vista
        }
        console.log(`Usuario ${user.username} ${newStatus === 'active' ? 'habilitado' : 'deshabilitado'}`);
      },
      error: (error) => {
        console.error('Error updating user status:', error);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  isUserActive(user: User): boolean {
    return user.status === 'active' || user.status === undefined; // Por defecto activo si no hay status
  }

  getUserStatusText(user: User): string {
    return this.isUserActive(user) ? 'Activo' : 'Inactivo';
  }

  getUserStatusClass(user: User): string {
    return this.isUserActive(user)
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  }
}
