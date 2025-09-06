import React, { useState, useRef, useEffect } from 'react';
import { useStyles } from '../../services/StyleContext';
import './CardCarousel.css';

/**
 * CardCarousel component displays a carousel of cards with navigation controls
 */
const CardCarousel = () => {
  const cardsContainerRef = useRef(null);
  const { colors, fonts, sizes } = useStyles();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardWidth = 300; // Fixed width of each card
  const gap = 20; // Space between cards
  const visibleCards = 3; // Number of visible cards in the carousel
  
  // Sample card data
  const cards = [
    {
      id: 1,
      title: 'Diseño Web',
      description: 'Creamos sitios web modernos y responsivos que se adaptan a cualquier dispositivo.',
      imageUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      buttonText: 'Ver más'
    },
    {
      id: 2,
      title: 'Desarrollo Móvil',
      description: 'Aplicaciones móviles nativas e híbridas para iOS y Android.',
      imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      buttonText: 'Ver más'
    },
    {
      id: 3,
      title: 'SEO',
      description: 'Mejoramos tu visibilidad en los motores de búsqueda.',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      buttonText: 'Ver más'
    },
    {
      id: 4,
      title: 'Marketing Digital',
      description: 'Estrategias de marketing digital para llegar a más clientes.',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      buttonText: 'Ver más'
    },
    {
      id: 5,
      title: 'Branding',
      description: 'Desarrollo de identidad de marca que destaque tu negocio.',
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      buttonText: 'Ver más'
    }
  ];

  // Handle scroll to previous or next cards
  const scroll = (direction) => {
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === 'next' && currentIndex < cards.length - visibleCards) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Scroll to a specific index
  const scrollToIndex = (index) => {
    if (index >= 0 && index <= cards.length - visibleCards) {
      setCurrentIndex(index);
    }
  };

  // Update transform style when currentIndex changes
  useEffect(() => {
    if (cardsContainerRef.current) {
      const translateX = -(currentIndex * (cardWidth + gap));
      cardsContainerRef.current.style.transform = `translateX(${translateX}px)`;
    }
  }, [currentIndex, cardWidth, gap]);

  return (
    <div className="carousel-container">
      <button 
        className="carousel-button prev" 
        onClick={() => scroll('prev')}
        disabled={currentIndex === 0}
        aria-label="Anterior"
        style={{
          background: colors[2],
          color: colors[1],
          borderColor: colors[0]
        }}
      >
        <span className="material-icons">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </span>
      </button>

      <div className="carousel-wrapper">
        <div ref={cardsContainerRef} className="cards-container">
          {cards.map(card => (
            <div 
              key={card.id}
              className="card"
              style={{
                background: colors[3],
                color: colors[0],
                borderColor: colors[2]
              }}
            >
              <div className="card-image">
                <img src={card.imageUrl} alt={card.title} />
              </div>
              <div className="card-content">
                <h3 
                  className="card-title"
                  style={{
                    color: colors[2],
                    fontFamily: fonts[0] ? 'CustomFont1, sans-serif' : 'inherit',
                    fontSize: `${sizes.subtitle}px`
                  }}
                >
                  {card.title}
                </h3>
                <p 
                  className="card-description"
                  style={{
                    color: colors[0],
                    fontFamily: fonts[1] ? 'CustomFont2, sans-serif' : 'inherit',
                    fontSize: `${sizes.paragraph}px`
                  }}
                >
                  {card.description}
                </p>
                <button 
                  className="card-button"
                  style={{
                    background: colors[2],
                    color: colors[1],
                    borderColor: colors[0],
                    fontFamily: fonts[1] ? 'CustomFont2, sans-serif' : 'inherit',
                    fontSize: `${sizes.paragraph}px`
                  }}
                >
                  {card.buttonText}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button 
        className="carousel-button next" 
        onClick={() => scroll('next')}
        disabled={currentIndex >= cards.length - visibleCards}
        aria-label="Siguiente"
        style={{
          background: colors[2],
          color: colors[1],
          borderColor: colors[0]
        }}
      >
        <span className="material-icons">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </span>
      </button>

      <div className="carousel-indicators">
        {Array.from({ length: cards.length - visibleCards + 1 }).map((_, i) => (
          <button 
            key={i}
            className={i === currentIndex ? 'active' : ''}
            onClick={() => scrollToIndex(i)}
            aria-label={`Ir a la tarjeta ${i + 1}`}
            style={{
              background: i === currentIndex ? colors[2] : colors[4],
              borderColor: colors[2]
            }}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default CardCarousel;
