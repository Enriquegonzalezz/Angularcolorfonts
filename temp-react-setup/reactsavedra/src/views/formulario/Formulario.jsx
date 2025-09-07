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
            
            {/* Botón para cargar datos de ejemplo */}
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
              {/* Step 1: Información Personal */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                        Nombre *
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.firstName ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                        placeholder="Ingrese su nombre"
                      />
                      {!formData.firstName && (
                        <p className="text-red-500 text-xs mt-1">
                          El nombre es requerido
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                        Apellido *
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.lastName ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                        placeholder="Ingrese su apellido"
                      />
                      {!formData.lastName && (
                        <p className="text-red-500 text-xs mt-1">
                          El apellido es requerido
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="maidenName" className="block text-sm font-medium text-foreground mb-2">
                        Apellido de Soltera
                      </label>
                      <input
                        id="maidenName"
                        type="text"
                        name="maidenName"
                        value={formData.maidenName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Apellido de soltera (opcional)"
                      />
                    </div>

                    {/* Campo de edad oculto (se calcula automáticamente) */}
                    <div style={{ display: 'none' }}>
                      <input
                        id="age"
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2"
                        placeholder="Ingrese su edad"
                        min="1"
                        max="120"
                      />
                    </div>

                    {/* Mostrar edad calculada */}
                    {formData.birthDate && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <label className="block text-sm font-medium text-green-800 mb-1">
                          Edad Calculada
                        </label>
                        <p className="text-lg font-semibold text-green-900">
                          {formData.age} años
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Calculada automáticamente desde la fecha de nacimiento
                        </p>
                      </div>
                    )}

                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-foreground mb-2">
                        Género *
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.gender ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                      >
                        <option value="">Seleccione un género</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                        <option value="otro">Otro</option>
                      </select>
                      {!formData.gender && (
                        <p className="text-red-500 text-xs mt-1">
                          El género es requerido
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.email ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                        placeholder="ejemplo@correo.com"
                      />
                      {!formData.email && (
                        <p className="text-red-500 text-xs mt-1">
                          El email es requerido
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                        Teléfono *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.phone ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                        placeholder="+1 (555) 123-4567"
                      />
                      {!formData.phone && (
                        <p className="text-red-500 text-xs mt-1">
                          El teléfono es requerido
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                        Nombre de Usuario *
                      </label>
                      <input
                        id="username"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.username ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                        placeholder="nombreusuario"
                      />
                      {!formData.username && (
                        <p className="text-red-500 text-xs mt-1">
                          El nombre de usuario es requerido
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="birthDate" className="block text-sm font-medium text-foreground mb-2">
                        Fecha de Nacimiento *
                      </label>
                      <input
                        id="birthDate"
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.birthDate ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                      />
                      {!formData.birthDate && (
                        <p className="text-red-500 text-xs mt-1">
                          La fecha de nacimiento es requerida
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Características Físicas */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="image" className="block text-sm font-medium text-foreground mb-2">
                        URL de Imagen
                      </label>
                      <input
                        id="image"
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>

                    <div>
                      <label htmlFor="bloodGroup" className="block text-sm font-medium text-foreground mb-2">
                        Grupo Sanguíneo *
                      </label>
                      <select
                        id="bloodGroup"
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.bloodGroup ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                      >
                        <option value="">Seleccione grupo sanguíneo</option>
                        {bloodGroups.map((group) => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                      {!formData.bloodGroup && (
                        <p className="text-red-500 text-xs mt-1">
                          El grupo sanguíneo es requerido
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="height" className="block text-sm font-medium text-foreground mb-2">
                        Altura (cm) *
                      </label>
                      <input
                        id="height"
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.height ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                        placeholder="170"
                        min="50"
                        max="250"
                      />
                      {!formData.height && (
                        <p className="text-red-500 text-xs mt-1">
                          La altura es requerida
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="weight" className="block text-sm font-medium text-foreground mb-2">
                        Peso (kg) *
                      </label>
                      <input
                        id="weight"
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.weight ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                        placeholder="70"
                        min="20"
                        max="300"
                      />
                      {!formData.weight && (
                        <p className="text-red-500 text-xs mt-1">
                          El peso es requerido
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="eyeColor" className="block text-sm font-medium text-foreground mb-2">
                        Color de Ojos *
                      </label>
                      <select
                        id="eyeColor"
                        name="eyeColor"
                        value={formData.eyeColor}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.eyeColor ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                      >
                        <option value="">Seleccione color de ojos</option>
                        {eyeColors.map((color) => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                      {!formData.eyeColor && (
                        <p className="text-red-500 text-xs mt-1">
                          El color de ojos es requerido
                        </p>
                      )}
                    </div>

                    {/* Hair fields */}
                    <div>
                      <div>
                        <label htmlFor="hairColor" className="block text-sm font-medium text-foreground mb-2">
                          Color de Cabello *
                        </label>
                        <select
                          id="hairColor"
                          name="hair.color"
                          value={formData.hair.color}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.hair.color ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                        >
                          <option value="">Seleccione color de cabello</option>
                          {hairColors.map((color) => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                        {!formData.hair.color && (
                          <p className="text-red-500 text-xs mt-1">
                            El color de cabello es requerido
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="hairType" className="block text-sm font-medium text-foreground mb-2 mt-4">
                          Tipo de Cabello *
                        </label>
                        <select
                          id="hairType"
                          name="hair.type"
                          value={formData.hair.type}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.hair.type ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                        >
                          <option value="">Seleccione tipo de cabello</option>
                          {hairTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        {!formData.hair.type && (
                          <p className="text-red-500 text-xs mt-1">
                            El tipo de cabello es requerido
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Dirección Personal */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Botón temporal para llenar dirección */}
                  <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        // Implementar función para llenar dirección de ejemplo
                        const sampleAddress = {
                          address: 'Calle Principal 123',
                          city: 'Ciudad Ejemplo',
                          state: 'Estado Ejemplo',
                          stateCode: 'EE',
                          postalCode: '12345',
                          coordinates: { lat: 40.7128, lng: -74.0060 },
                          country: 'País Ejemplo'
                        };
                        
                        setFormData(prev => ({
                          ...prev,
                          address: sampleAddress
                        }));
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm mr-2"
                    >
                      📍 Llenar Dirección de Ejemplo
                    </button>
                    <p className="text-sm mt-2">Haz clic para llenar automáticamente los campos de dirección (para pruebas)</p>
                  </div>

                  {/* Mapa */}
                  <div className="map-container mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <h3 className="text-lg font-medium text-blue-900">Selecciona tu ubicación</h3>
                      </div>
                      <p className="text-blue-700 text-sm">
                        💡 Haz clic en el mapa para seleccionar tu ubicación. Los campos de dirección se llenarán automáticamente.
                      </p>
                    </div>
                    <div id="map" className="h-64 rounded-lg border border-gray-300" ref={mapRef}></div>
                  </div>

                  {/* Address fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
                        Dirección *
                      </label>
                      <input
                        id="address"
                        type="text"
                        name="address.address"
                        value={formData.address.address}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.address.address ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                        placeholder="Calle y número"
                      />
                      {!formData.address.address && (
                        <p className="text-red-500 text-xs mt-1">
                          La dirección es requerida
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
                        Ciudad *
                      </label>
                      <input
                        id="city"
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.address.city ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                        placeholder="Ciudad"
                      />
                      {!formData.address.city && (
                        <p className="text-red-500 text-xs mt-1">
                          La ciudad es requerida
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-foreground mb-2">
                        Estado/Provincia *
                      </label>
                      <input
                        id="state"
                        type="text"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.address.state ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                        placeholder="Estado o provincia"
                      />
                      {!formData.address.state && (
                        <p className="text-red-500 text-xs mt-1">
                          El estado/provincia es requerido
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="stateCode" className="block text-sm font-medium text-foreground mb-2">
                        Código de Estado
                      </label>
                      <input
                        id="stateCode"
                        type="text"
                        name="address.stateCode"
                        value={formData.address.stateCode}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Código de estado (ej. CA)"
                      />
                    </div>

                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-foreground mb-2">
                        Código Postal *
                      </label>
                      <input
                        id="postalCode"
                        type="text"
                        name="address.postalCode"
                        value={formData.address.postalCode}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.address.postalCode ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                        placeholder="Código postal"
                      />
                      {!formData.address.postalCode && (
                        <p className="text-red-500 text-xs mt-1">
                          El código postal es requerido
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-foreground mb-2">
                        País *
                      </label>
                      <input
                        id="country"
                        type="text"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.address.country ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                        placeholder="País"
                      />
                      {!formData.address.country && (
                        <p className="text-red-500 text-xs mt-1">
                          El país es requerido
                        </p>
                      )}
                    </div>

                    {/* Campos ocultos para coordenadas */}
                    <div className="hidden">
                      <input
                        type="number"
                        name="address.coordinates.lat"
                        value={formData.address.coordinates.lat}
                        onChange={handleChange}
                      />
                      <input
                        type="number"
                        name="address.coordinates.lng"
                        value={formData.address.coordinates.lng}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Información Académica y Laboral */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="macAddress" className="block text-sm font-medium text-foreground mb-2">
                        Dirección MAC
                      </label>
                      <input
                        id="macAddress"
                        type="text"
                        name="macAddress"
                        value={formData.macAddress}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="XX:XX:XX:XX:XX:XX"
                      />
                    </div>

                    <div>
                      <label htmlFor="university" className="block text-sm font-medium text-foreground mb-2">
                        Universidad *
                      </label>
                      <input
                        id="university"
                        type="text"
                        name="university"
                        value={formData.university}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.university ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                        placeholder="Nombre de la universidad"
                      />
                      {!formData.university && (
                        <p className="text-red-500 text-xs mt-1">
                          La universidad es requerida
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Company Information */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="department" className="block text-sm font-medium text-foreground mb-2">
                          Departamento *
                        </label>
                        <select
                          id="department"
                          name="company.department"
                          value={formData.company.department}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.company.department ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                        >
                          <option value="">Seleccione departamento</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                        {!formData.company.department && (
                          <p className="text-red-500 text-xs mt-1">
                            El departamento es requerido
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-2">
                          Nombre de la Empresa *
                        </label>
                        <input
                          id="companyName"
                          type="text"
                          name="company.name"
                          value={formData.company.name}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.company.name ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                          placeholder="Nombre de la empresa"
                        />
                        {!formData.company.name && (
                          <p className="text-red-500 text-xs mt-1">
                            El nombre de la empresa es requerido
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="companyTitle" className="block text-sm font-medium text-foreground mb-2">
                          Cargo *
                        </label>
                        <input
                          id="companyTitle"
                          type="text"
                          name="company.title"
                          value={formData.company.title}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.company.title ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                          placeholder="Cargo o puesto"
                        />
                        {!formData.company.title && (
                          <p className="text-red-500 text-xs mt-1">
                            El cargo es requerido
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-4">Dirección de la Empresa</h3>

                      {/* Mapa para la empresa */}
                      <div className="map-container mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                          <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <h3 className="text-lg font-medium text-blue-900">Ubicación de la Empresa</h3>
                          </div>
                          <p className="text-blue-700 text-sm">
                            💡 Haz clic en el mapa para seleccionar la ubicación de la empresa.
                          </p>
                        </div>
                        <div id="companyMap" className="h-64 rounded-lg border border-gray-300" ref={companyMapRef}></div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label htmlFor="companyAddress" className="block text-sm font-medium text-foreground mb-2">
                            Dirección de la Empresa *
                          </label>
                          <input
                            id="companyAddress"
                            type="text"
                            name="company.address.address"
                            value={formData.company.address.address}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.company.address.address ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                            placeholder="Dirección de la empresa"
                          />
                          {!formData.company.address.address && (
                            <p className="text-red-500 text-xs mt-1">
                              La dirección de la empresa es requerida
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="companyCity" className="block text-sm font-medium text-foreground mb-2">
                            Ciudad de la Empresa *
                          </label>
                          <input
                            id="companyCity"
                            type="text"
                            name="company.address.city"
                            value={formData.company.address.city}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.company.address.city ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                            placeholder="Ciudad de la empresa"
                          />
                          {!formData.company.address.city && (
                            <p className="text-red-500 text-xs mt-1">
                              La ciudad de la empresa es requerida
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="companyState" className="block text-sm font-medium text-foreground mb-2">
                            Estado/Provincia de la Empresa *
                          </label>
                          <input
                            id="companyState"
                            type="text"
                            name="company.address.state"
                            value={formData.company.address.state}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.company.address.state ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                            placeholder="Estado o provincia de la empresa"
                          />
                          {!formData.company.address.state && (
                            <p className="text-red-500 text-xs mt-1">
                              El estado/provincia de la empresa es requerido
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="companyStateCode" className="block text-sm font-medium text-foreground mb-2">
                            Código de Estado de la Empresa
                          </label>
                          <input
                            id="companyStateCode"
                            type="text"
                            name="company.address.stateCode"
                            value={formData.company.address.stateCode}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Código de estado de la empresa"
                          />
                        </div>

                        <div>
                          <label htmlFor="companyPostalCode" className="block text-sm font-medium text-foreground mb-2">
                            Código Postal de la Empresa *
                          </label>
                          <input
                            id="companyPostalCode"
                            type="text"
                            name="company.address.postalCode"
                            value={formData.company.address.postalCode}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.company.address.postalCode ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                            placeholder="Código postal de la empresa"
                          />
                          {!formData.company.address.postalCode && (
                            <p className="text-red-500 text-xs mt-1">
                              El código postal de la empresa es requerido
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="companyCountry" className="block text-sm font-medium text-foreground mb-2">
                            País de la Empresa *
                          </label>
                          <input
                            id="companyCountry"
                            type="text"
                            name="company.address.country"
                            value={formData.company.address.country}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.company.address.country ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                            placeholder="País de la empresa"
                          />
                          {!formData.company.address.country && (
                            <p className="text-red-500 text-xs mt-1">
                              El país de la empresa es requerido
                            </p>
                          )}
                        </div>

                        {/* Campos ocultos para coordenadas de la empresa */}
                        <div className="hidden">
                          <input
                            type="number"
                            name="company.address.coordinates.lat"
                            value={formData.company.address.coordinates.lat}
                            onChange={handleChange}
                          />
                          <input
                            type="number"
                            name="company.address.coordinates.lng"
                            value={formData.company.address.coordinates.lng}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Información Bancaria */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  {/* Botón temporal para llenar datos bancarios */}
                  <div className="bg-purple-100 border border-purple-400 text-purple-700 px-4 py-3 rounded mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        // Implementar función para llenar datos bancarios de ejemplo
                        const sampleBankData = {
                          bank: {
                            cardExpire: '10/25',
                            cardNumber: '4532123456789012',
                            cardType: 'Visa',
                            currency: 'USD',
                            iban: 'US45154641654654'
                          },
                          ein: '12-3456789',
                          ssn: '123-45-6789'
                        };
                        
                        setFormData(prev => ({
                          ...prev,
                          ...sampleBankData
                        }));
                      }}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm mr-2"
                    >
                      💳 Llenar Datos Bancarios de Ejemplo
                    </button>
                    <p className="text-sm mt-2">Haz clic para llenar automáticamente los datos bancarios (para pruebas)</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bank fields */}
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-foreground mb-2">
                        Número de Tarjeta *
                      </label>
                      <input
                        id="cardNumber"
                        type="text"
                        name="bank.cardNumber"
                        value={formData.bank.cardNumber}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.bank.cardNumber ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                        placeholder="XXXX XXXX XXXX XXXX"
                      />
                      {!formData.bank.cardNumber && (
                        <p className="text-red-500 text-xs mt-1">
                          El número de tarjeta es requerido
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="cardExpire" className="block text-sm font-medium text-foreground mb-2">
                        Fecha de Expiración *
                      </label>
                      <input
                        id="cardExpire"
                        type="text"
                        name="bank.cardExpire"
                        value={formData.bank.cardExpire}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.bank.cardExpire ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                        placeholder="MM/AA"
                      />
                      {!formData.bank.cardExpire && (
                        <p className="text-red-500 text-xs mt-1">
                          La fecha de expiración es requerida
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="cardType" className="block text-sm font-medium text-foreground mb-2">
                        Tipo de Tarjeta *
                      </label>
                      <select
                        id="cardType"
                        name="bank.cardType"
                        value={formData.bank.cardType}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.bank.cardType ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                      >
                        <option value="">Seleccione tipo de tarjeta</option>
                        {cardTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      {!formData.bank.cardType && (
                        <p className="text-red-500 text-xs mt-1">
                          El tipo de tarjeta es requerido
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="currency" className="block text-sm font-medium text-foreground mb-2">
                        Moneda *
                      </label>
                      <select
                        id="currency"
                        name="bank.currency"
                        value={formData.bank.currency}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.bank.currency ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                      >
                        <option value="">Seleccione moneda</option>
                        {currencies.map((currency) => (
                          <option key={currency} value={currency}>{currency}</option>
                        ))}
                      </select>
                      {!formData.bank.currency && (
                        <p className="text-red-500 text-xs mt-1">
                          La moneda es requerida
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="iban" className="block text-sm font-medium text-foreground mb-2">
                        IBAN *
                      </label>
                      <input
                        id="iban"
                        type="text"
                        name="bank.iban"
                        value={formData.bank.iban}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.bank.iban ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                        placeholder="IBAN"
                      />
                      {!formData.bank.iban && (
                        <p className="text-red-500 text-xs mt-1">
                          El IBAN es requerido
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="ein" className="block text-sm font-medium text-foreground mb-2">
                        EIN
                      </label>
                      <input
                        id="ein"
                        type="text"
                        name="ein"
                        value={formData.ein}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="XX-XXXXXXX"
                      />
                    </div>

                    <div>
                      <label htmlFor="ssn" className="block text-sm font-medium text-foreground mb-2">
                        SSN *
                      </label>
                      <input
                        id="ssn"
                        type="text"
                        name="ssn"
                        value={formData.ssn}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.ssn ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                        placeholder="XXX-XX-XXXX"
                      />
                      {!formData.ssn && (
                        <p className="text-red-500 text-xs mt-1">
                          El SSN es requerido
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Configuración Final */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="userAgent" className="block text-sm font-medium text-foreground mb-2">
                        User Agent
                      </label>
                      <input
                        id="userAgent"
                        type="text"
                        name="userAgent"
                        value={formData.userAgent}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="User Agent"
                      />
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-foreground mb-2">
                        Rol *
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 ${formData.role ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500'}`}
                      >
                        <option value="">Seleccione rol</option>
                        {roles.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                      {!formData.role && (
                        <p className="text-red-500 text-xs mt-1">
                          El rol es requerido
                        </p>
                      )}
                    </div>

                    {/* Crypto fields */}
                    <div>
                      <label htmlFor="cryptoCoin" className="block text-sm font-medium text-foreground mb-2">
                        Criptomoneda
                      </label>
                      <select
                        id="cryptoCoin"
                        name="crypto.coin"
                        value={formData.crypto.coin}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Seleccione criptomoneda</option>
                        {cryptoCoins.map((coin) => (
                          <option key={coin} value={coin}>{coin}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="cryptoWallet" className="block text-sm font-medium text-foreground mb-2">
                        Wallet
                      </label>
                      <input
                        id="cryptoWallet"
                        type="text"
                        name="crypto.wallet"
                        value={formData.crypto.wallet}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Dirección de wallet"
                      />
                    </div>

                    <div>
                      <label htmlFor="cryptoNetwork" className="block text-sm font-medium text-foreground mb-2">
                        Red
                      </label>
                      <select
                        id="cryptoNetwork"
                        name="crypto.network"
                        value={formData.crypto.network}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Seleccione red</option>
                        {cryptoNetworks.map((network) => (
                          <option key={network} value={network}>{network}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <h3 className="text-lg font-medium text-green-800 mb-2">Resumen de Registro</h3>
                        <p className="text-green-700 text-sm">
                          Todos los campos requeridos han sido completados. Haga clic en "Enviar Formulario" para finalizar el registro.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
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
