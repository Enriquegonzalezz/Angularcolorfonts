import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import * as L from 'leaflet';

interface UserData {
  id?: number;
  firstName: string;
  lastName: string;
  maidenName?: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  birthDate: string;
  image?: string;
  bloodGroup: string;
  height: number;
  weight: number;
  eyeColor: string;
  hair: {
    color: string;
    type: string;
  };
  ip?: string;
  address: {
    address: string;
    city: string;
    state: string;
    stateCode: string;
    postalCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    country: string;
  };
  macAddress?: string;
  university: string;
  bank: {
    cardExpire: string;
    cardNumber: string;
    cardType: string;
    currency: string;
    iban: string;
  };
  company: {
    department: string;
    name: string;
    title: string;
    address: {
      address: string;
      city: string;
      state: string;
      stateCode: string;
      postalCode: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      country: string;
    };
  };
  ein?: string;
  ssn?: string;
  userAgent?: string;
  crypto?: {
    coin: string;
    wallet: string;
    network: string;
  };
  role: string;
}

@Component({
  selector: 'app-formulario-view',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './formulario-view.html',
  styleUrl: './formulario-view.css'
})
export class FormularioView implements OnInit, OnDestroy {
  form: FormGroup;
  isSubmitting = false;
  submitted = false;
  currentStep = 1;
  totalSteps = 6;
  map: L.Map | null = null;
  marker: L.Marker | null = null;
  companyMap: L.Map | null = null;
  companyMarker: L.Marker | null = null;

  // Definir los pasos del wizard
  steps = [
    {
      id: 1,
      title: 'Información Personal',
      description: 'Datos básicos del usuario',
      fields: ['firstName', 'lastName', 'maidenName', 'age', 'gender', 'email', 'phone', 'username', 'birthDate']
    },
    {
      id: 2,
      title: 'Características Físicas',
      description: 'Información física y apariencia',
      fields: ['bloodGroup', 'height', 'weight', 'eyeColor', 'hair']
    },
    {
      id: 3,
      title: 'Dirección Personal',
      description: 'Ubicación y dirección personal',
      fields: ['address']
    },
    {
      id: 4,
      title: 'Información Académica y Laboral',
      description: 'Universidad y datos profesionales',
      fields: ['macAddress', 'university', 'company']
    },
    {
      id: 5,
      title: 'Información Bancaria',
      description: 'Datos bancarios y financieros',
      fields: ['bank', 'ein', 'ssn']
    },
    {
      id: 6,
      title: 'Configuración Final',
      description: 'Rol y configuración del sistema',
      fields: ['userAgent', 'crypto', 'role']
    }
  ];

  // Opciones para los selectores
  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  eyeColors = ['Marrón', 'Azul', 'Verde', 'Avellana', 'Gris', 'Ámbar'];
  hairColors = ['Negro', 'Marrón', 'Rubio', 'Rojo', 'Gris', 'Blanco'];
  hairTypes = ['Liso', 'Ondulado', 'Rizado', 'Enrulado'];
  cardTypes = ['Visa', 'Mastercard', 'American Express', 'Discover', 'Elo'];
  currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CAD', 'AUD'];
  departments = ['Ingeniería', 'Ventas', 'Marketing', 'Recursos Humanos', 'Finanzas', 'TI', 'Operaciones'];
  roles = ['administrador', 'usuario', 'moderador', 'editor'];
  cryptoCoins = ['Bitcoin', 'Ethereum', 'Cardano', 'Solana', 'Polkadot'];
  cryptoNetworks = ['Ethereum (ERC20)', 'Bitcoin', 'Binance Smart Chain', 'Polygon'];

  // Hacer Math disponible en el template
  Math = Math;

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
    this.form = this.fb.group({
      // Información Personal
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      maidenName: [''],
      age: [0, [Validators.required, Validators.min(1), Validators.max(120)]],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-()]+$/)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      birthDate: ['', Validators.required],

      // Características Físicas
      image: [''],
      bloodGroup: ['', Validators.required],
      height: ['', [Validators.required, Validators.min(50), Validators.max(250)]],
      weight: ['', [Validators.required, Validators.min(20), Validators.max(300)]],
      eyeColor: ['', Validators.required],
      hair: this.fb.group({
        color: ['', Validators.required],
        type: ['', Validators.required]
      }),

      // Dirección Personal
      address: this.fb.group({
        address: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        stateCode: ['', Validators.required],
        postalCode: ['', Validators.required],
        coordinates: this.fb.group({
          lat: [0, Validators.required],
          lng: [0, Validators.required]
        }),
        country: ['', Validators.required]
      }),

      // Información Académica y Laboral
      macAddress: [''],
      university: ['', Validators.required],
      company: this.fb.group({
        department: ['', Validators.required],
        name: ['', Validators.required],
        title: ['', Validators.required],
        address: this.fb.group({
          address: ['', Validators.required],
          city: ['', Validators.required],
          state: ['', Validators.required],
          stateCode: ['', Validators.required],
          postalCode: ['', Validators.required],
          coordinates: this.fb.group({
            lat: [0, Validators.required],
            lng: [0, Validators.required]
          }),
          country: ['', Validators.required]
        })
      }),

      // Información Bancaria
      bank: this.fb.group({
        cardExpire: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]],
        cardNumber: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(19)]],
        cardType: ['', Validators.required],
        currency: ['', Validators.required],
        iban: ['', [Validators.required, Validators.minLength(10)]]
      }),
      ein: [''],
      ssn: [''],

      // Configuración Final
      userAgent: [''],
      crypto: this.fb.group({
        coin: ['', Validators.required],
        wallet: ['', Validators.required],
        network: ['', Validators.required]
      }),
      role: ['', Validators.required]
    });

    // Suscribirse a cambios en birthDate para calcular edad automáticamente
    this.form.get('birthDate')?.valueChanges.subscribe(birthDate => {
      if (birthDate) {
        const age = this.calculateAge(birthDate);
        this.form.patchValue({ age }, { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    // Configurar iconos de Leaflet para evitar errores 404
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjUgMEM1LjU5NiAwIDAgNS41OTYgMCAxMi41QzAgMTkuNDA0IDUuNTk2IDI1IDEyLjUgMjVDMTkuNDA0IDI1IDI1IDE5LjQwNCAyNSAxMi41QzI1IDUuNTk2IDE5LjQwNCAwIDEyLjUgMFoiIGZpbGw9IiMyMjIiLz4KPHBhdGggZD0iTTEyLjUgNkM5LjQ2MiA2IDcgOC40NjIgNyAxMS41QzcgMTQuNTM4IDkuNDYyIDE3IDEyLjUgMTdDMTUuNTM4IDE3IDE4IDE0LjUzOCAxOCAxMS41QzE4IDguNDYyIDE1LjUzOCA2IDEyLjUgNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
      iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjUgMEM1LjU5NiAwIDAgNS41OTYgMCAxMi41QzAgMTkuNDA0IDUuNTk2IDI1IDEyLjUgMjVDMTkuNDA0IDI1IDI1IDE5LjQwNCAyNSAxMi41QzI1IDUuNTk2IDE5LjQwNCAwIDEyLjUgMFoiIGZpbGw9IiMyMjIiLz4KPHBhdGggZD0iTTEyLjUgNkM5LjQ2MiA2IDcgOC40NjIgNyAxMS41QzcgMTQuNTM4IDkuNDYyIDE3IDEyLjUgMTdDMTUuNTM4IDE3IDE4IDE0LjUzOCAxOCAxMS41QzE4IDguNDYyIDE1LjUzOCA2IDEyLjUgNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
      shadowUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCA0MCAxNSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGVsbGlwc2UgY3g9IjIwIiBjeT0iMTIiIHJ4PSIxMiIgcnk9IjQiIGZpbGw9InJnYmEoMCwwLDAsMC4yKSIvPgo8L3N2Zz4K'
    });
    
    this.initializeMap();
    this.loadUserData();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
    if (this.companyMap) {
      this.companyMap.remove();
    }
  }

  calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  initializeMap() {
    // Inicializar el mapa después de que el DOM esté listo
    setTimeout(() => {
      const mapContainer = document.getElementById('map');
      console.log('Map container found:', mapContainer);

      if (mapContainer) {
        try {
          // Limpiar cualquier mapa existente
          if (this.map) {
            this.map.remove();
          }

          // Crear el mapa
          this.map = L.map('map').setView([40.7128, -74.0060], 13); // Nueva York por defecto
          console.log('Map created successfully');

          // Agregar capa de tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
          }).addTo(this.map);

          // Agregar marcador inicial
          this.marker = L.marker([40.7128, -74.0060]).addTo(this.map);
          console.log('Marker added');

          // Evento de clic en el mapa
          this.map.on('click', (e: L.LeafletMouseEvent) => {
            this.onMapClick(e);
          });

          // Forzar un refresh del mapa
          setTimeout(() => {
            if (this.map) {
              this.map.invalidateSize();
              console.log('Map refreshed');
            }
          }, 500);

        } catch (error) {
          console.error('Error initializing map:', error);
        }
      } else {
        console.error('Map container not found');
      }
    }, 1000);
  }

  initializeCompanyMap() {
    setTimeout(() => {
      const companyMapContainer = document.getElementById('company-map');
      
      if (companyMapContainer) {
        try {
          if (this.companyMap) {
            this.companyMap.remove();
          }

          this.companyMap = L.map('company-map').setView([40.7128, -74.0060], 13);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
          }).addTo(this.companyMap);

          this.companyMarker = L.marker([40.7128, -74.0060]).addTo(this.companyMap);

          this.companyMap.on('click', (e: L.LeafletMouseEvent) => {
            this.onCompanyMapClick(e);
          });

          setTimeout(() => {
            if (this.companyMap) {
              this.companyMap.invalidateSize();
            }
          }, 500);

        } catch (error) {
          console.error('Error initializing company map:', error);
        }
      }
    }, 1000);
  }

  onMapClick(e: L.LeafletMouseEvent) {
    const { lat, lng } = e.latlng;

    // Actualizar marcador
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    }

    // Actualizar coordenadas en el formulario
    this.form.patchValue({
      address: {
        coordinates: { lat, lng }
      }
    });

    // Geocodificación inversa para obtener dirección
    this.reverseGeocode(lat, lng);
  }

  onCompanyMapClick(e: L.LeafletMouseEvent) {
    const { lat, lng } = e.latlng;

    if (this.companyMarker) {
      this.companyMarker.setLatLng([lat, lng]);
    }

    this.form.patchValue({
      company: {
        address: {
          coordinates: { lat, lng }
        }
      }
    });

    this.reverseGeocodeCompany(lat, lng);
  }

  async reverseGeocode(lat: number, lng: number) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();

      if (data.address) {
        const address = data.address;
        this.form.patchValue({
          address: {
            address: `${address.house_number || ''} ${address.road || ''}`.trim(),
            city: address.city || address.town || address.village || '',
            state: address.state || '',
            stateCode: address.state_code || '',
            postalCode: address.postcode || '',
            country: address.country || '',
            coordinates: { lat, lng }
          }
        });
      }
    } catch (error) {
      console.error('Error en geocodificación:', error);
    }
  }

  async reverseGeocodeCompany(lat: number, lng: number) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();

      if (data.address) {
        const address = data.address;
        this.form.patchValue({
          company: {
            address: {
              address: `${address.house_number || ''} ${address.road || ''}`.trim(),
              city: address.city || address.town || address.village || '',
              state: address.state || '',
              stateCode: address.state_code || '',
              postalCode: address.postcode || '',
              country: address.country || '',
              coordinates: { lat, lng }
            }
          }
        });
      }
    } catch (error) {
      console.error('Error en geocodificación de empresa:', error);
    }
  }

  get f() {
    return this.form.controls;
  }

  get currentStepData() {
    return this.steps.find(step => step.id === this.currentStep);
  }

  get progressPercentage() {
    return (this.currentStep / this.totalSteps) * 100;
  }

  isStepValid(stepId: number): boolean {
    const step = this.steps.find(s => s.id === stepId);
    if (!step) return false;

    // Validar cada campo del paso
    for (const fieldName of step.fields) {
      const control = this.form.get(fieldName);

      if (control) {
        // Si es un FormGroup (como 'hair'), validar todos sus controles
        if (control instanceof FormGroup) {
          if (control.invalid) {
            return false;
          }
        } else {
          // Si es un control simple
          if (control.invalid) {
            return false;
          }
        }
      } else {
        return false;
      }
    }

    return true;
  }

  canGoToStep(stepId: number): boolean {
    if (stepId <= this.currentStep) return true;

    if (stepId === this.currentStep + 1) {
      return this.isStepValid(this.currentStep);
    }

    for (let i = 1; i < stepId; i++) {
      if (!this.isStepValid(i)) return false;
    }

    return true;
  }

  goToStep(stepId: number) {
    if (this.canGoToStep(stepId)) {
      this.currentStep = stepId;
      
      // Inicializar mapas según el paso
      if (this.currentStep === 3) {
        setTimeout(() => {
          this.initializeMap();
        }, 100);
      } else if (this.currentStep === 4) {
        setTimeout(() => {
          this.initializeCompanyMap();
        }, 100);
      }
    }
  }

  nextStep() {
    if (this.isStepValid(this.currentStep) && this.currentStep < this.totalSteps) {
      this.currentStep++;
      
      // Inicializar mapas según el paso
      if (this.currentStep === 3) {
        setTimeout(() => {
          this.initializeMap();
        }, 100);
      } else if (this.currentStep === 4) {
        setTimeout(() => {
          this.initializeCompanyMap();
        }, 100);
      }
    } else {
      this.markStepFieldsAsTouched(this.currentStep);
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  markStepFieldsAsTouched(stepId: number) {
    const step = this.steps.find(s => s.id === stepId);
    if (!step) return;

    step.fields.forEach(fieldName => {
      const control = this.form.get(fieldName);
      if (control) {
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(nestedField => {
            const nestedControl = control.get(nestedField);
            if (nestedControl) {
              nestedControl.markAsTouched();
            }
          });
        } else {
          control.markAsTouched();
        }
      }
    });
  }

  onSubmit() {
    this.submitted = true;
    this.markAllFieldsAsTouched();

    if (this.form.valid) {
      this.isSubmitting = true;

      // Generar el JSON con el formato requerido
      const userData = {
        ...this.form.value,
        ip: this.generateRandomIP(),
        userAgent: this.form.value.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36'
      };

      console.log('JSON generado:', userData);

      // Obtener el token del localStorage
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        console.log('⚠️ No hay token - Modo de prueba');
        console.log('📝 Mostrando datos que se enviarían al backend:');
        console.log(userData);
        
        // Simular envío exitoso en modo de prueba
        setTimeout(() => {
          this.isSubmitting = false;
          this.submitted = false;
          alert('¡Formulario enviado exitosamente! (Modo de prueba - No se guardó en el backend)');
        }, 2000);
        return;
      }

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });

      // Obtener el ID del usuario del token o localStorage
      const userId = this.getUserIdFromToken(token);

      if (!userId) {
        alert('Error: No se pudo obtener el ID del usuario');
        this.isSubmitting = false;
        return;
      }

      // Enviar datos al backend
      this.http.patch(`http://localhost:3000/updateUserInfo/${userId}`, userData, { headers })
        .subscribe({
          next: (response: any) => {
            console.log('Respuesta del servidor:', response);
            this.isSubmitting = false;
            this.submitted = false;
            this.form.reset();
            this.currentStep = 1;
            alert('¡Formulario enviado exitosamente!');
          },
          error: (error) => {
            console.error('Error al enviar datos:', error);
            this.isSubmitting = false;
            alert(`Error al enviar el formulario: ${error.error?.error || error.message}`);
          }
        });
    } else {
      this.currentStep = 1;
    }
  }

  getUserIdFromToken(token: string | null): number | null {
    if (!token) {
      console.log('❌ Token es null o undefined');
      return null;
    }
    
    try {
      console.log('🔐 Decodificando token...');
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('❌ Token no tiene el formato correcto (3 partes)');
        return null;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      console.log('📋 Payload del token:', payload);
      
      if (!payload.id) {
        console.log('❌ No se encontró ID en el payload del token');
        return null;
      }
      
      console.log('✅ ID extraído del token:', payload.id);
      return payload.id;
    } catch (error) {
      console.error('❌ Error al decodificar el token:', error);
      return null;
    }
  }

  markAllFieldsAsTouched() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control) {
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(nestedKey => {
            const nestedControl = control.get(nestedKey);
            if (nestedControl) {
              if (nestedControl instanceof FormGroup) {
                Object.keys(nestedControl.controls).forEach(deepKey => {
                  const deepControl = nestedControl.get(deepKey);
                  if (deepControl) {
                    deepControl.markAsTouched();
                  }
                });
              } else {
                nestedControl.markAsTouched();
              }
            }
          });
        } else {
          control.markAsTouched();
        }
      }
    });
  }

  onReset() {
    this.form.reset();
    this.submitted = false;
    this.isSubmitting = false;
    this.currentStep = 1;
  }

  generateRandomIP(): string {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.errors && (control.touched || this.submitted)) {
      if (control.errors['required']) {
        return 'Este campo es requerido';
      }
      if (control.errors['email']) {
        return 'Por favor ingrese un email válido';
      }
      if (control.errors['minlength']) {
        return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      }
      if (control.errors['maxlength']) {
        return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
      }
      if (control.errors['min']) {
        return `Valor mínimo: ${control.errors['min'].min}`;
      }
      if (control.errors['max']) {
        return `Valor máximo: ${control.errors['max'].max}`;
      }
      if (control.errors['pattern']) {
        if (controlName === 'phone') {
          return 'Por favor ingrese un teléfono válido';
        }
        if (controlName === 'cardExpire') {
          return 'Formato: MM/YY';
        }
        if (controlName === 'cardNumber') {
          return 'Debe tener entre 13 y 19 dígitos';
        }
        if (controlName === 'iban') {
          return 'Formato IBAN inválido';
        }
      }
    }
    return '';
  }

  getFieldClass(controlName: string): string {
    const control = this.form.get(controlName);
    const isInvalid = control?.invalid && (control.touched || this.submitted);
    const isValid = control?.valid && (control.touched || this.submitted);

    if (isInvalid) {
      return 'border-red-500 focus:ring-red-500';
    }
    if (isValid) {
      return 'border-green-500 focus:ring-green-500';
    }
    return 'border-input focus:ring-green-500';
  }

  getStepStatus(stepId: number): 'completed' | 'current' | 'upcoming' {
    if (stepId < this.currentStep) return 'completed';
    if (stepId === this.currentStep) return 'current';
    return 'upcoming';
  }

  // Función temporal para llenar dirección de ejemplo
  fillSampleAddress() {
    this.form.patchValue({
      address: {
        address: '123 Main Street',
        city: 'New York',
        state: 'New York',
        stateCode: 'NY',
        postalCode: '10001',
        coordinates: {
          lat: 40.7128,
          lng: -74.0060
        },
        country: 'United States'
      }
    });
    console.log('Dirección de ejemplo llenada');
  }

  // Función temporal para llenar datos bancarios de ejemplo
  fillSampleBankData() {
    this.form.patchValue({
      bank: {
        cardExpire: '12/25',
        cardNumber: '1234567890123456',
        cardType: 'Visa',
        currency: 'USD',
        iban: 'ES9121000418450200051332'
      }
    });
    console.log('Datos bancarios de ejemplo llenados');
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  loadUserData() {
    console.log('🔍 Iniciando carga de datos del usuario...');
    const token = localStorage.getItem('access_token');
    console.log('Token encontrado:', token ? 'Sí' : 'No');
    
    if (!token) {
      console.log('❌ No hay token, usuario no autenticado');
      console.log('💡 Sugerencia: Asegúrate de estar logueado en la aplicación');
      return;
    }

    const userId = this.getUserIdFromToken(token);
    console.log('ID del usuario extraído del token:', userId);
    
    if (!userId) {
      console.log('❌ No se pudo obtener el ID del usuario');
      console.log('💡 Sugerencia: El token podría estar corrupto o expirado');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = `http://localhost:3000/userInfo/${userId}`;
    console.log('🌐 Haciendo petición a:', url);
    console.log('📋 Headers enviados:', headers);

    this.http.get(url, { headers })
      .subscribe({
        next: (userData: any) => {
          console.log('✅ Datos del usuario cargados exitosamente');
          console.log('📊 Estructura de datos recibida:', {
            hasUserData: !!userData,
            userFields: userData ? Object.keys(userData) : [],
            hasCabellos: !!userData?.Cabellos,
            hasDirecciones: !!userData?.Direcciones,
            hasInformacionBancaria: !!userData?.InformacionBancaria,
            hasInformacionCompania: !!userData?.InformacionCompania,
            hasCriptomonedas: !!userData?.Criptomonedas
          });
          
          if (!userData) {
            console.log('⚠️ No se recibieron datos del usuario');
            return;
          }
          
          this.populateFormWithUserData(userData);
        },
        error: (error) => {
          console.error('❌ Error al cargar datos del usuario');
          console.error('Status:', error.status);
          console.error('Status Text:', error.statusText);
          console.error('Message:', error.message);
          
          if (error.status === 401) {
            console.log('🔐 Error 401: Usuario no autorizado');
            console.log('💡 Sugerencia: El token podría estar expirado o ser inválido');
          } else if (error.status === 404) {
            console.log('🔍 Error 404: Usuario no encontrado');
            console.log('💡 Sugerencia: El ID del usuario no existe en la base de datos');
          } else if (error.status === 0) {
            console.log('🌐 Error de conexión: No se puede conectar al servidor');
            console.log('💡 Sugerencia: Verifica que el backend esté ejecutándose en http://localhost:3000');
          }
          
          console.error('Error completo:', error);
        }
      });
  }

  populateFormWithUserData(userData: any) {
    console.log('🔄 Iniciando mapeo de datos del usuario...');
    console.log('Datos recibidos del backend:', userData);
    
    // Verificar si hay datos básicos del usuario
    if (!userData || !userData.id) {
      console.log('❌ No hay datos válidos del usuario para mapear');
      return;
    }
    
    // Mapear los datos del backend al formulario
    const formData = {
      // Datos básicos del usuario
      firstName: userData.first_name || '',
      lastName: userData.last_name || '',
      maidenName: userData.maiden_name || '',
      age: userData.age || 0,
      gender: userData.gender || '',
      email: userData.email || '',
      phone: userData.phone || '',
      username: userData.username || '',
      birthDate: userData.birth_date || '',
      image: userData.image_url || '',
      bloodGroup: userData.blood_group || '',
      height: userData.height_cm || '',
      weight: userData.weight_kg || '',
      eyeColor: userData.eye_color || '',
      macAddress: userData.mac_address || '',
      university: userData.university || '',
      ein: userData.ein || '',
      ssn: userData.ssn || '',
      userAgent: userData.user_agent || '',
      role: userData.admin === 1 ? 'administrador' : 'usuario',

      // Información del cabello
      hair: userData.Cabellos ? {
        color: userData.Cabellos.color || '',
        type: userData.Cabellos.type || ''
      } : { color: '', type: '' },

      // Dirección personal (buscar la dirección de tipo 'personal')
      address: (() => {
        if (!userData.Direcciones || !Array.isArray(userData.Direcciones)) {
          console.log('📍 No hay direcciones o no es un array');
          return {
            address: '', city: '', state: '', stateCode: '', postalCode: '', country: '',
            coordinates: { lat: 0, lng: 0 }
          };
        }
        const personalAddress = userData.Direcciones.find((d: any) => d.type === 'personal');
        if (!personalAddress) {
          console.log('📍 No se encontró dirección personal');
          return {
            address: '', city: '', state: '', stateCode: '', postalCode: '', country: '',
            coordinates: { lat: 0, lng: 0 }
          };
        }
        console.log('📍 Dirección personal encontrada:', personalAddress);
        return {
          address: personalAddress.address_line || '',
          city: personalAddress.city || '',
          state: personalAddress.state || '',
          stateCode: personalAddress.state_code || '',
          postalCode: personalAddress.postal_code || '',
          country: personalAddress.country || '',
          coordinates: {
            lat: personalAddress.latitude || 0,
            lng: personalAddress.longitude || 0
          }
        };
      })(),

      // Información bancaria
      bank: userData.InformacionBancaria ? {
        cardExpire: userData.InformacionBancaria.card_expire || '',
        cardNumber: userData.InformacionBancaria.card_number || '',
        cardType: userData.InformacionBancaria.card_type || '',
        currency: userData.InformacionBancaria.currency || '',
        iban: userData.InformacionBancaria.iban || ''
      } : {
        cardExpire: '', cardNumber: '', cardType: '', currency: '', iban: ''
      },

      // Información de la empresa
      company: userData.InformacionCompania ? {
        department: userData.InformacionCompania.department || '',
        name: userData.InformacionCompania.company_name || '',
        title: userData.InformacionCompania.title || '',
        address: {
          address: userData.InformacionCompania.address_line || '',
          city: userData.InformacionCompania.city || '',
          state: userData.InformacionCompania.state || '',
          stateCode: userData.InformacionCompania.state_code || '',
          postalCode: userData.InformacionCompania.postal_code || '',
          country: userData.InformacionCompania.country || '',
          coordinates: {
            lat: userData.InformacionCompania.latitude || 0,
            lng: userData.InformacionCompania.longitude || 0
          }
        }
      } : {
        department: '', name: '', title: '',
        address: {
          address: '', city: '', state: '', stateCode: '', postalCode: '', country: '',
          coordinates: { lat: 0, lng: 0 }
        }
      },

      // Información de criptomonedas
      crypto: userData.Criptomonedas ? {
        coin: userData.Criptomonedas.coin || '',
        wallet: userData.Criptomonedas.wallet || '',
        network: userData.Criptomonedas.network || ''
      } : {
        coin: '', wallet: '', network: ''
      }
    };

    console.log('📝 Datos mapeados para el formulario:', formData);

    // Llenar el formulario con los datos
    this.form.patchValue(formData);
    console.log('✅ Formulario actualizado con los datos del usuario');
    
    // Mostrar resumen de datos cargados
    const datosCargados = Object.entries(formData).filter(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v && v !== '');
      }
      return value && value !== '';
    });
    
    console.log('📊 Resumen de datos cargados:', datosCargados.map(([key]) => key));
  }

  // Método temporal para probar la carga de datos
  testLoadUserData() {
    console.log('🧪 Iniciando prueba de carga de datos...');
    this.loadUserData();
  }

  // Método para probar conexión básica con el backend
  testBackendConnection() {
    console.log('🔌 Probando conexión básica con el backend...');
    
    // Probar endpoint de autenticación
    this.http.get('http://localhost:3000/auth')
      .subscribe({
        next: (response: any) => {
          console.log('✅ Conexión exitosa con /auth:', response);
        },
        error: (error) => {
          console.error('❌ Error en /auth:', error);
        }
      });
  }

  // Método para mostrar información del token
  showTokenInfo() {
    const token = localStorage.getItem('access_token');
    console.log('🔐 Información del token:');
    console.log('Token existe:', !!token);
    
    if (token) {
      console.log('Token completo:', token);
      const userId = this.getUserIdFromToken(token);
      console.log('ID extraído:', userId);
    } else {
      console.log('💡 No hay token - Usuario no logueado');
      console.log('💡 Para probar el formulario, puedes:');
      console.log('   1. Hacer login en la aplicación');
      console.log('   2. Usar el modo de prueba con datos de ejemplo');
    }
  }

  // Método para cargar datos de ejemplo (modo de prueba)
  loadSampleData() {
    console.log('🧪 Cargando datos de ejemplo para modo de prueba...');
    
    const sampleData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      maidenName: '',
      age: 28,
      gender: 'masculino',
      email: 'juan.perez@ejemplo.com',
      phone: '+1 (555) 123-4567',
      username: 'juanperez',
      birthDate: '1995-06-15',
      image: 'https://ejemplo.com/foto.jpg',
      bloodGroup: 'A+',
      height: 175,
      weight: 70,
      eyeColor: 'Marrón',
      macAddress: '00:1B:44:11:3A:B7',
      university: 'Universidad Nacional',
      ein: '12-3456789',
      ssn: '123-45-6789',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      role: 'usuario',

      hair: {
        color: 'Negro',
        type: 'Liso'
      },

      address: {
        address: '123 Calle Principal',
        city: 'Ciudad de México',
        state: 'Distrito Federal',
        stateCode: 'CDMX',
        postalCode: '12345',
        country: 'México',
        coordinates: {
          lat: 19.4326,
          lng: -99.1332
        }
      },

      bank: {
        cardExpire: '12/25',
        cardNumber: '1234567890123456',
        cardType: 'Visa',
        currency: 'USD',
        iban: 'ES9121000418450200051332'
      },

      company: {
        department: 'Ingeniería',
        name: 'Tech Solutions S.A.',
        title: 'Desarrollador Senior',
        address: {
          address: '456 Avenida Empresarial',
          city: 'Guadalajara',
          state: 'Jalisco',
          stateCode: 'JAL',
          postalCode: '54321',
          country: 'México',
          coordinates: {
            lat: 20.6597,
            lng: -103.3496
          }
        }
      },

      crypto: {
        coin: 'Bitcoin',
        wallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        network: 'Ethereum (ERC20)'
      }
    };

    console.log('📝 Datos de ejemplo cargados:', sampleData);
    this.form.patchValue(sampleData);
    console.log('✅ Formulario actualizado con datos de ejemplo');
  }
}
