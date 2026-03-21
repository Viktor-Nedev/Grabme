import '@fontsource/manrope/500.css';
import '@fontsource/manrope/700.css';
import '@fontsource/sora/600.css';
import '@fontsource/sora/700.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@/app/App';
import { AppDataProvider } from '@/contexts/AppDataContext';
import { AuthProvider } from '@/contexts/AuthContext';
import '@/style.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppDataProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AppDataProvider>
  </React.StrictMode>,
);
