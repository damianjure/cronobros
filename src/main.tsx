import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import AuthGate from './components/AuthGate.tsx';
import TripsGate from './components/TripsGate.tsx';
import './lib/material.ts';
import './index.css';
import './material-theme.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthGate>
      <TripsGate>
        <App />
      </TripsGate>
    </AuthGate>
  </StrictMode>,
);
