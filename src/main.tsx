import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Suppress extension-related errors
window.addEventListener('error', (event) => {
  if (event.message?.includes('message channel closed') || 
      event.message?.includes('runtime.lastError')) {
    event.preventDefault();
    console.warn('Browser extension error suppressed:', event.message);
  }
});

// Handle unhandled promise rejections from extensions
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('message channel closed') ||
      event.reason?.message?.includes('runtime.lastError')) {
    event.preventDefault();
    console.warn('Browser extension promise rejection suppressed:', event.reason?.message);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
