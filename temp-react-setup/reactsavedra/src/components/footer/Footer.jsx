import React from 'react';
import { useStyles } from '../../services/StyleContext';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { colors, fonts, sizes, loading } = useStyles();

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <footer className="footer" style={{ background: colors[1] }}>
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title" 
                style={{
                  color: colors[2],
                  fontFamily: fonts[0] ? 'CustomFont1, sans-serif' : 'inherit',
                  fontSize: `${sizes.subtitle}px`
                }}>
              ColorFonts
            </h3>
            <p className="footer-description"
               style={{
                 color: colors[0],
                 fontFamily: fonts[1] ? 'CustomFont2, sans-serif' : 'inherit',
                 fontSize: `${sizes.paragraph}px`
               }}>
              Interactúa con tu app de React los colores y fuentes que quieras
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle" 
                style={{
                  color: colors[2],
                  fontFamily: fonts[0] ? 'CustomFont1, sans-serif' : 'inherit',
                  fontSize: `${sizes.paragraph}px`
                }}>
              Enlaces
            </h4>
            <ul className="footer-links">
              <li>
                <a href="#features" 
                   style={{
                     color: colors[0],
                     fontFamily: fonts[1] ? 'CustomFont2, sans-serif' : 'inherit',
                     fontSize: `${sizes.paragraph}px`
                   }}>
                  Features
                </a>
              </li>
              <li>
                <a href="#testimonials" 
                   style={{
                     color: colors[0],
                     fontFamily: fonts[1] ? 'CustomFont2, sans-serif' : 'inherit',
                     fontSize: `${sizes.paragraph}px`
                   }}>
                  Testimonials
                </a>
              </li>
              <li>
                <a href="#pricing" 
                   style={{
                     color: colors[0],
                     fontFamily: fonts[1] ? 'CustomFont2, sans-serif' : 'inherit',
                     fontSize: `${sizes.paragraph}px`
                   }}>
                  Pricing
                </a>
              </li>
              <li>
                <a href="#faq" 
                   style={{
                     color: colors[0],
                     fontFamily: fonts[1] ? 'CustomFont2, sans-serif' : 'inherit',
                     fontSize: `${sizes.paragraph}px`
                   }}>
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle" 
                style={{
                  color: colors[2],
                  fontFamily: fonts[0] ? 'CustomFont1, sans-serif' : 'inherit',
                  fontSize: `${sizes.paragraph}px`
                }}>
              Contacto
            </h4>
            <ul className="footer-links">
              <li>
                <a href="mailto:contact@colorfonts.com" 
                   style={{
                     color: colors[0],
                     fontFamily: fonts[1] ? 'CustomFont2, sans-serif' : 'inherit',
                     fontSize: `${sizes.paragraph}px`
                   }}>
                  contact@colorfonts.com
                </a>
              </li>
              <li>
                <a href="https://github.com/leoMirandaa/shadcn-landing-page.git" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   style={{
                     color: colors[0],
                     fontFamily: fonts[1] ? 'CustomFont2, sans-serif' : 'inherit',
                     fontSize: `${sizes.paragraph}px`
                   }}>
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p style={{
             color: colors[0],
             fontFamily: fonts[1] ? 'CustomFont2, sans-serif' : 'inherit',
             fontSize: `${sizes.paragraph}px`
           }}>
            &copy; {currentYear} ColorFonts. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
