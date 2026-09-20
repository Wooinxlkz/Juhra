import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import { ConsentBanner } from '@/components/consent-banner';
import { applyStoredConsent } from '@/lib/font-consent';

import './index.css';

// Loads Google Fonts only if the person already accepted on a previous
// launch. On a fresh install this does nothing, and the app renders with
// system fonts until (and unless) the consent banner is accepted.
applyStoredConsent();

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <App />
    <ConsentBanner />
  </ErrorBoundary>,
);
