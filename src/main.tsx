import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import and verify AWS config on startup
import awsConfig from './config/aws';

// Force log the API URL being used
console.log('🚀 SOCIALS APP STARTING');
console.log('🌐 Production API URL:', awsConfig.apiUrl);
console.log('🔧 Environment:', import.meta.env.MODE);
console.log('🏠 Hostname:', window.location.hostname);

// Verify no localhost is being used
if (awsConfig.apiUrl.includes('localhost')) {
  console.error('❌ CRITICAL ERROR: API URL contains localhost!', awsConfig.apiUrl);
  alert('Configuration Error: API URL contains localhost. Please refresh the page.');
} else {
  console.log('✅ API URL is correct - using production endpoint');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
