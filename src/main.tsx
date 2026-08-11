import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';

import './i18n';
import './styles/globals.css';

import App from './App';
import { AnalyticsProvider } from './providers/AnalyticsProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
          <AnalyticsProvider>
            <App />
          </AnalyticsProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
