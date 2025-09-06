import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStyles } from '../../services/StyleContext';
import { useAuth } from '../../services/AuthContext';
import Hero from '../../components/hero/Hero';
import Footer from '../../components/footer/Footer';
import MediaCarousel from '../../modules/carousel/media-carousel/MediaCarousel';
import TangramLoader from '../../components/tangram-loader/TangramLoader';
import CardCarousel from '../../components/card-carousel/CardCarousel';
import './Home.css';

// Componentes temporales para los que aún no se han migrado

const Home = () => {
  // Usar el contexto de estilos y autenticación
  const { colors, fonts, sizes, loading } = useStyles();
  const { isAuthenticated } = useAuth();

  // Estilos dinámicos
  const titleStyle = {
    color: colors[0],
    fontFamily: fonts[0] ? 'CustomFont1, sans-serif' : 'inherit',
    fontSize: `${sizes.title}px`
  };

  const subtitleStyle = {
    color: colors[2],
    fontFamily: fonts[1] ? 'CustomFont2, sans-serif' : 'inherit',
    fontSize: `${sizes.subtitle}px`
  };

  if (loading) {
    return <TangramLoader isLoading={loading} onSkip={() => {}} />;
  }

  return (
    <div className="home-container">
      <Hero />

      {/* Sección de servicios con carrusel */}
      <section className="services-section" style={{ background: colors[1] }}>
        <div className="container">
          <h2 className="section-title" style={titleStyle}>
            Nuestros Servicios
          </h2>
          <p className="section-subtitle" style={subtitleStyle}>
            Descubre lo que podemos hacer por ti
          </p>
          <CardCarousel />
        </div>
      </section>

      {/* Media Gallery Section */}
      <section className="media-section" style={{ background: colors[0] }}>
        <div className="container">
          <h2 className="section-title" style={{ ...titleStyle, color: colors[1] }}>
            Media Gallery
          </h2>
          <p className="section-subtitle" style={subtitleStyle}>
            View our latest images and videos
          </p>
          <div className="media-gallery-preview">
            <div className="media-item">Media preview content</div>
            <div className="media-item">Media preview content</div>
            <div className="media-item">Media preview content</div>
          </div>
          <div className="upload-buttons">
            <Link to="/media" className="btn btn-primary">View Full Gallery</Link>
            {isAuthenticated() && (
              <>
                <Link to="/upload/image" className="btn btn-primary">Upload Image</Link>
                <Link to="/upload/video" className="btn btn-secondary">Upload Video</Link>
              </>
            )}
          </div>
        </div>
      </section>

   

      <Footer />
    </div>
  );
};

export default Home;
