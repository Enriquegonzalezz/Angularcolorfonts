import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StyleProvider } from '../../services/StyleContext';
import Home from './Home';

// Mock del contexto de estilos
jest.mock('../../services/StyleContext', () => ({
  useStyles: () => ({
    colors: ['#000000', '#FFFFFF', '#F596D3', '#D247BF', '#61DAFB'],
    fonts: ['font1', 'font2'],
    sizes: { title: 48, subtitle: 32, paragraph: 18 },
    loading: false
  }),
  StyleProvider: ({ children }) => children
}));

describe('Home Component', () => {
  test('renders without crashing', () => {
    render(
      <BrowserRouter>
        <StyleProvider>
          <Home />
        </StyleProvider>
      </BrowserRouter>
    );
    
    // Verificar que elementos clave estén presentes
    expect(screen.getByText(/Nuestros Servicios/i)).toBeInTheDocument();
    expect(screen.getByText(/Media Gallery/i)).toBeInTheDocument();
  });
});
