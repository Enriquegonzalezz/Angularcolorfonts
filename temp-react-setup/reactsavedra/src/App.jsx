import { Routes, Route, Navigate } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import './App.css'

// Importamos los contextos que hemos creado
import { AuthProvider } from './services/AuthContext'
import { StyleProvider } from './services/StyleContext'

// Importamos los componentes que ya hemos migrado
import VideoUpload from './modules/video/video-upload/VideoUpload'
import AdminRoute from './guards/AdminRoute'

// Importamos los componentes que ya hemos migrado
import Home from './views/home/Home'
import Login from './views/login/Login'
import Signup from './views/signup/Signup'
import Colors from './views/colors/Colors'
import Fonts from './views/fonts/Fonts'
import Formulario from './views/formulario/Formulario'
import Datatable from './views/datatable/Datatable'

// Importamos los componentes comunes
import Navbar from './components/navbar/Navbar'
import Hero from './components/hero/Hero'
import Footer from './components/footer/Footer'
import MediaCarousel from './modules/carousel/media-carousel/MediaCarousel'
import ImageUpload from './modules/image/image-upload/ImageUpload'
import Tangram from './tangram/Tangram'
import TangramLoader from './components/tangram-loader/TangramLoader'

function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1000); // Short delay to show loading animation
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <StyleProvider>
        <div className="app-container">
          <TangramLoader isLoading={initialLoading} onSkip={() => setInitialLoading(false)} />
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/colors" element={<Colors />} />
              <Route path="/fonts" element={<Fonts />} />
              <Route path="/formulario" element={<Formulario />} />
              <Route path="/datatable" element={<Datatable />} />
              <Route path="/upload/image" element={
            
                  <ImageUpload />
              
              } />
              <Route path="/upload/video" element={
            
                  <VideoUpload />
              
              } />
              <Route path="/media" element={
            
                  <MediaCarousel />
              
              } />
              <Route path="/tangram" element={<Tangram />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
         
        </div>
      </StyleProvider>
    </AuthProvider>
  )
}

export default App
