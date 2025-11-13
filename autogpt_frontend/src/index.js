import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter basename={process.env.REACT_APP_FRONTEND_URL ? new URL(process.env.REACT_APP_FRONTEND_URL).pathname : '/'}>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
