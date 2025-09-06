import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../services/AuthContext';
import TangramLoader from '../../components/tangram-loader/TangramLoader';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 Intentando login con:', formData.email);
      
      const response = await axios.post('http://localhost:3000/login', {
        email: formData.email,
        password: formData.password,
      });

      console.log('✅ Login exitoso:', response.data);
      
      if (response.data.token) {
        // Usar el método login del contexto de autenticación
        const loginSuccess = login(response.data.token);
        
        if (loginSuccess) {
          console.log('💾 Token guardado en localStorage como "access_token"');
          navigate('/');
          alert('Login exitoso: ' + response.data.message);
        } else {
          throw new Error('Error al procesar el token de autenticación');
        }
      } else {
        throw new Error('No se recibió token en la respuesta');
      }
    } catch (err) {
      console.error('❌ Error en login:', err);
      
      if (err.response) {
        if (err.response.status === 400) {
          setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
        } else if (err.response.status === 401) {
          setError('Usuario o contraseña incorrectos, vuelva a intentarlo.');
        } else if (err.response.status === 403) {
          setError('Tu cuenta ha sido inhabilitada. Contacta al administrador.');
        } else {
          // Verificar si es un error de usuario inhabilitado
          const errorMessage = err.response.data?.error || err.message || 'Error desconocido';
          if (errorMessage.includes('inhabilitada')) {
            setError('Tu cuenta ha sido inhabilitada. Contacta al administrador.');
          } else {
            setError('Error inesperado: ' + errorMessage);
          }
        }
      } else if (err.request) {
        setError('Error de conexión. Verifica que el servidor esté ejecutándose.');
      } else {
        setError('Error inesperado: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark py-6 flex flex-col justify-center items-center sm:py-12">
      <TangramLoader isLoading={isLoading} onSkip={() => setIsLoading(false)} />
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-card border-2 border-green-500 shadow-lg rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-card border-2 border-green-500 shadow-lg rounded-3xl sm:p-12">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-green-400 mb-2">Login to your account</h1>
            <p className="text-gray-400">Welcome back! Please login to continue.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-[#23272e] border-green-500 text-gray-200 placeholder-gray-500 w-full"
                placeholder="Email address"
                required
                style={{
                  paddingTop: '1.25rem',
                  paddingBottom: '1.25rem',
                  borderWidth: '2px',
                  borderRadius: '0.375rem',
                  paddingLeft: '0.75rem',
                  paddingRight: '0.75rem'
                }}
              />
              <span className="text-xs text-gray-500 block mt-1 ml-1">Enter your email</span>
            </div>

            <div className="space-y-1">
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="bg-[#23272e] border-green-500 text-gray-200 placeholder-gray-500 w-full"
                placeholder="Password"
                required
                minLength="6"
                style={{
                  paddingTop: '1.25rem',
                  paddingBottom: '1.25rem',
                  borderWidth: '2px',
                  borderRadius: '0.375rem',
                  paddingLeft: '0.75rem',
                  paddingRight: '0.75rem'
                }}
              />
              <span className="text-xs text-gray-500 block mt-1 ml-1">At least 6 characters</span>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white border-2 border-green-500 py-4 font-bold rounded focus:outline-none focus:shadow-outline"
              disabled={isLoading}
              style={{ transition: 'background-color 0.2s' }}
            >
              {isLoading ? (
                <span className="animate-pulse flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          <div className="text-center pt-6">
            <div className="relative flex items-center justify-center mb-6">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>

            <p className="text-gray-400 text-sm">
              Don't have an account?
              <Link 
                to="/signup" 
                className="text-green-400 hover:text-green-300 hover:underline font-medium cursor-pointer"
                style={{ textShadow: '0 0 5px rgba(74, 222, 128, 0.3)' }}
              >
                {' '}Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
