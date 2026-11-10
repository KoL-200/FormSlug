import React from 'react';
import ReactDOM from 'react-dom/client';
import App, { PublicFormPage } from './App.jsx';
import './styles.css';

const publicFormMatch = window.location.pathname.match(/^\/s\/([^/]+)\/?$/);
let publicSlug = '';
if (publicFormMatch) {
  try {
    publicSlug = decodeURIComponent(publicFormMatch[1]);
  } catch {
    publicSlug = publicFormMatch[1];
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {publicFormMatch ? <PublicFormPage slug={publicSlug} /> : <App />}
  </React.StrictMode>,
);
