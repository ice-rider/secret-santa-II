import { render } from 'solid-js/web';
import App from './App';
import './index.css';

const root = document.getElementById('root');

if (root) {
  render(() =>
    <App />,
  root);
}

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/src/service-worker.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}