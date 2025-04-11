
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';

// Ensure global is defined for browser compatibility
if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}

// Redirect to /videos automatically
const initialPath = window.location.pathname === '/' ? '/videos' : window.location.pathname;
window.history.replaceState(null, '', initialPath);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
