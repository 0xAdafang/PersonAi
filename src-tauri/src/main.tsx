import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="theme-catppuccin-mocha min-h-screen bg-background text-foreground">
      <App />
    </div>
  </React.StrictMode>,
);