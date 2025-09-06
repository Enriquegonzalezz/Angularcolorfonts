import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../services/AuthContext';
import TangramLoader from '../../components/tangram-loader/TangramLoader';
import './Formulario.css';

// Importar Leaflet (necesitarás instalar: npm install leaflet react-leaflet)
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

const Formulario = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const mapRef = useRef(null);
  const companyMapRef = useRef(null);
  const markerRef = useRef(null);
  const companyMarkerRef = useRef(null);
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    // Información Personal
    firstName: '',
    lastName: '',
    maidenName: '',
    age: 0,
    gender: '',
    email: '',
    phone: '',
    username: '',
    birthDate: '',

    // Características Físicas
    image: '',
    bloodGroup: '',
    height: '',
    weight: '',
    eyeColor: '',
    hair: {
      color: '',
      type: ''
    },

    // Dirección Personal
    address: {
      address: '',
      city: '',
      state: '',
      stateCode: '',
      postalCode: '',
      coordinates: {
        lat: 0,
        lng: 0
      },
      country: ''
    },

    // Información Académica y Laboral
    macAddress: '',
    university: '',
    company: {
      department: '',
      name: '',
      title: '',
      address: {
        address: '',
        city: '',
        state: '',
        stateCode: '',
        postalCode: '',
        coordinates: {
          lat: 0,
          lng: 0
        },
        country: ''
      }
    },

    // Información Bancaria
    bank: {
      cardExpire: '',
      cardNumber: '',
      cardType: '',
      currency: '',
      iban: ''
    },
    ein: '',
    ssn: '',

    // Configuración Final
    userAgent: '',
    crypto: {
      coin: '',
      wallet: '',
      network: ''
    },
    role: ''
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Definir los pasos del wizard
  const steps = [
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
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const eyeColors = ['Marrón', 'Azul', 'Verde', 'Avellana', 'Gris', 'Ámbar'];
  const hairColors = ['Negro', 'Marrón', 'Rubio', 'Rojo', 'Gris', 'Blanco'];
  const hairTypes = ['Liso', 'Ondulado', 'Rizado', 'Enrulado'];
  const cardTypes = ['Visa', 'Mastercard', 'American Express', 'Discover', 'Elo'];
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CAD', 'AUD'];
  const departments = ['Ingeniería', 'Ventas', 'Marketing', 'Recursos Humanos', 'Finanzas', 'TI', 'Operaciones'];
  const roles = ['administrador', 'usuario', 'moderador', 'editor'];
  const cryptoCoins = ['Bitcoin', 'Ethereum', 'Cardano', 'Solana', 'Polkadot'];
  const cryptoNetworks = ['Ethereum (ERC20)', 'Bitcoin', 'Binance Smart Chain', 'Polygon'];
  
  const totalSteps = steps.length;
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
  
  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Inicializar mapas
  useEffect(() => {
    // Aquí iría la inicialización de los mapas con Leaflet
    // Necesitarías instalar leaflet y react-leaflet
  }, []);
  
  // Calcular edad a partir de la fecha de nacimiento
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Manejar cambio en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Manejar campos anidados
    if (name.includes('.')) {
      const parts = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        
        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]];
        }
        
        current[parts[parts.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Actualizar edad si cambia la fecha de nacimiento
      if (name === 'birthDate') {
        const age = calculateAge(value);
        setFormData(prev => ({
          ...prev,
          age
        }));
      }
    }
  };
  
  // Cargar datos de ejemplo
  const loadSampleData = () => {
    // Aquí iría la lógica para cargar datos de ejemplo
  };
  
  // Navegar al paso anterior
  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Navegar al paso siguiente
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Obtener estado del paso (completado, actual, pendiente)
  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };
  
  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Aquí iría la lógica para enviar el formulario al servidor
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <TangramLoader isLoading={isSubmitting} onSkip={() => setIsSubmitting(false)} />
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-card rounded-xl shadow-sm border p-6 md:p-8">
            <h1 className="text-3xl font-bold text-green-400 text-center mb-2">
              Registro de Usuario Completo
            </h1>
            
            {/* AQUÍ ES DONDE DEBES COPIAR Y PEGAR EL HTML DEL FORMULARIO */}
            {/* 
              Reemplaza esta sección con el HTML del formulario de Angular,
              adaptando la sintaxis de Angular a React:
              
              - Cambia *ngIf por condicionales de React: {currentStep === 1 && (...)}
              - Cambia [formGroup] por onSubmit={handleSubmit}
              - Cambia formControlName por name y value={formData.campo} onChange={handleChange}
              - Cambia (click) por onClick
              - Cambia [class] por className con condicionales: className={`... ${condition ? 'class1' : 'class2'}`}
              - Cambia [style] por style={{...}}
              - Cambia formGroupName por grupos de campos en el estado
              - Cambia *ngFor por .map()
            */}
            
            {/* Ejemplo de cómo adaptar un fragmento: */}
            <div className="bg-purple-100 border border-purple-400 text-purple-700 px-4 py-3 rounded mb-4">
              <button
                type="button"
                onClick={loadSampleData}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm"
              >
                📝 Cargar Datos de Ejemplo
              </button>
              <p className="text-sm mt-2">Haz clic para llenar el formulario con datos de prueba</p>
            </div>
            <p className="text-muted-foreground text-center mb-8">
              Complete todos los campos para crear un perfil de usuario completo
            </p>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-foreground">
                  Paso {currentStep} de {totalSteps}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progressPercentage)}% completado
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-8 overflow-x-auto">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center min-w-0"
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 cursor-pointer flex-shrink-0 ${
                      getStepStatus(step.id) === 'completed' 
                        ? 'bg-green-600 border-green-600 text-white' 
                        : getStepStatus(step.id) === 'current'
                          ? 'border-green-600 text-green-600' 
                          : 'border-gray-700 text-gray-700'
                    }`}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    {getStepStatus(step.id) === 'completed' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Aquí va el contenido del formulario según el paso actual */}
              
              {/* Botones de navegación */}
              <div className="flex justify-between pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={previousStep}
                  disabled={currentStep === 1}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 rounded-md font-medium transition-colors border border-border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Formulario'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Formulario;
