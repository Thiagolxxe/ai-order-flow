
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';

// Ensure global is defined for browser compatibility
if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}

// Log application start
console.log('Starting DeliveryAI application...');
console.log('Initial path:', window.location.pathname);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
