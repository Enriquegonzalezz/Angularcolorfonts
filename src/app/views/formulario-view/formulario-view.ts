import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
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

  // Definir los pasos del wizard
  steps = [
    {
      id: 1,
      title: 'Información Personal',
      description: 'Datos básicos del usuario',
      fields: ['firstName', 'lastName', 'maidenName', 'age', 'gender', 'email', 'phone', 'username', 'password', 'birthDate']
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
  eyeColors = ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber'];
  hairColors = ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White'];
  hairTypes = ['Straight', 'Wavy', 'Curly', 'Coily'];
  cardTypes = ['Visa', 'Mastercard', 'American Express', 'Discover', 'Elo'];
  currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CAD', 'AUD'];
  departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'IT', 'Operations'];
  roles = ['admin', 'user', 'moderator', 'editor'];
  cryptoCoins = ['Bitcoin', 'Ethereum', 'Cardano', 'Solana', 'Polkadot'];
  cryptoNetworks = ['Ethereum (ERC20)', 'Bitcoin', 'Binance Smart Chain', 'Polygon'];

  // Hacer Math disponible en el template
  Math = Math;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      // Información Personal
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      maidenName: [''],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-()]+$/)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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
  }

  ngOnInit() {
    this.initializeMap();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
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

    console.log(`=== VALIDANDO PASO ${stepId} ===`);

    // Validar cada campo del paso
    for (const fieldName of step.fields) {
      const control = this.form.get(fieldName);
      console.log(`Verificando campo: ${fieldName}`);

      if (control) {
        // Si es un FormGroup (como 'hair'), validar todos sus controles
        if (control instanceof FormGroup) {
          console.log(`  ${fieldName} es un FormGroup, válido: ${control.valid}`);
          if (control.invalid) {
            console.log(`  ❌ FormGroup inválido en paso ${stepId}:`, fieldName, control.errors);
            Object.keys(control.controls).forEach(nestedField => {
              const nestedControl = control.get(nestedField);
              if (nestedControl && nestedControl.invalid) {
                console.log(`    - ${nestedField}:`, nestedControl.errors);
              }
            });
            return false;
          }
        } else {
          // Si es un control simple
          console.log(`  ${fieldName} es un control simple, válido: ${control.valid}, valor: "${control.value}"`);
          if (control.invalid) {
            console.log(`  ❌ Campo inválido en paso ${stepId}:`, fieldName, control.errors);
            return false;
          }
        }
      } else {
        console.log(`  ❌ Control no encontrado: ${fieldName}`);
        return false;
      }
    }

    console.log(`✅ Paso ${stepId} es válido`);
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
    }
  }

  nextStep() {
    console.log('Intentando ir al siguiente paso...');
    console.log('Paso actual:', this.currentStep);
    console.log('¿Paso actual es válido?', this.isStepValid(this.currentStep));

    // Log detallado para el paso 2
    if (this.currentStep === 2) {
      console.log('=== DEBUG PASO 2 ===');
      console.log('Formulario completo válido:', this.form.valid);
      console.log('Estado del FormGroup hair:', this.form.get('hair')?.valid);
      console.log('hair.color válido:', this.form.get('hair.color')?.valid);
      console.log('hair.type válido:', this.form.get('hair.type')?.valid);
      console.log('bloodGroup válido:', this.form.get('bloodGroup')?.valid);
      console.log('height válido:', this.form.get('height')?.valid);
      console.log('weight válido:', this.form.get('weight')?.valid);
      console.log('eyeColor válido:', this.form.get('eyeColor')?.valid);
      console.log('===================');
    }

    if (this.isStepValid(this.currentStep) && this.currentStep < this.totalSteps) {
      this.currentStep++;
      console.log('Pasando al paso:', this.currentStep);

      // Reinicializar mapa si llegamos al paso 3
      if (this.currentStep === 3) {
        setTimeout(() => {
          this.initializeMap();
        }, 100);
      }
    } else {
      console.log('No se puede avanzar. Errores en el paso actual:');
      this.showStepValidationErrors(this.currentStep);
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  showStepValidationErrors(stepId: number) {
    const step = this.steps.find(s => s.id === stepId);
    if (!step) return;

    console.log(`Errores en el paso ${stepId}:`);
    step.fields.forEach(fieldName => {
      const control = this.form.get(fieldName);
      if (control) {
        if (control instanceof FormGroup) {
          // Para FormGroups, mostrar errores de todos los controles anidados
          Object.keys(control.controls).forEach(nestedField => {
            const nestedControl = control.get(nestedField);
            if (nestedControl && nestedControl.invalid) {
              console.log(`- ${fieldName}.${nestedField}:`, nestedControl.errors);
            }
          });
        } else {
          // Para controles simples
          if (control.invalid) {
            console.log(`- ${fieldName}:`, control.errors);
          }
        }
      }
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.valid) {
      this.isSubmitting = true;

      // Generar el JSON con el formato requerido
      const userData: UserData = {
        id: Math.floor(Math.random() * 1000) + 1, // ID aleatorio
        ...this.form.value,
        ip: this.generateRandomIP(),
        userAgent: this.form.value.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36'
      };

      console.log('JSON generado:', userData);

      // Simular envío
      setTimeout(() => {
        this.isSubmitting = false;
        this.submitted = false;
        this.form.reset();
        this.currentStep = 1;
        alert('¡Formulario enviado exitosamente!');
      }, 2000);
    } else {
      this.currentStep = 1;
    }
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
    if (control?.errors && this.submitted) {
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
          return 'Debe tener 16 dígitos';
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
    const isInvalid = control?.invalid && this.submitted;
    const isValid = control?.valid && this.submitted;

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

  // Función temporal para debug
  debugStep2() {
    console.log('=== DEBUG COMPLETO PASO 2 ===');
    console.log('Formulario completo:', this.form.value);
    console.log('Formulario válido:', this.form.valid);

    const step2Fields = ['bloodGroup', 'height', 'weight', 'eyeColor', 'hair'];
    step2Fields.forEach(field => {
      const control = this.form.get(field);
      console.log(`${field}:`, {
        value: control?.value,
        valid: control?.valid,
        errors: control?.errors,
        touched: control?.touched,
        dirty: control?.dirty
      });
    });

    // Verificar FormGroup hair específicamente
    const hairGroup = this.form.get('hair');
    if (hairGroup && hairGroup instanceof FormGroup) {
      console.log('Hair group:', {
        valid: hairGroup.valid,
        value: hairGroup.value,
        errors: hairGroup.errors
      });

      Object.keys(hairGroup.controls).forEach(key => {
        const control = hairGroup.get(key);
        console.log(`  hair.${key}:`, {
          value: control?.value,
          valid: control?.valid,
          errors: control?.errors
        });
      });
    }

    console.log('¿Paso 2 es válido?', this.isStepValid(2));
    console.log('========================');
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
}
