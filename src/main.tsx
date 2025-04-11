
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';

// Ensure global is defined for browser compatibility
if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}

// Configuração de log detalhado para ambiente de desenvolvimento
if (import.meta.env.DEV) {
  console.log('==== DeliveryAI - Modo de Desenvolvimento ====');
  console.log('Versão da aplicação:', import.meta.env.VITE_APP_VERSION || '1.0.0');
  console.log('API URL:', import.meta.env.VITE_API_URL || 'https://deliverai.onrender.com');
  console.log('Caminho inicial:', window.location.pathname);
  
  // Definir manipuladores de erro globais para melhor diagnóstico
  window.addEventListener('error', (event) => {
    console.error('Erro global detectado:', event.error);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Promessa não tratada:', event.reason);
  });
}

// Log application start
console.log('Iniciando aplicação DeliveryAI...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
