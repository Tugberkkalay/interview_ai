import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error('ERROR rendering App:', error);
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="color: red; font-size: 24px; padding: 50px; background: yellow;">
        <h1>ERROR RENDERING APP</h1>
        <pre>${String(error)}</pre>
        <pre>${error instanceof Error ? error.stack : ''}</pre>
      </div>
    `;
  }
}