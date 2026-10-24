import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { BookmarksProvider } from './context/BookmarksContext.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <BookmarksProvider>
          <App />
        </BookmarksProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
