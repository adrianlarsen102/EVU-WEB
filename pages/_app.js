import '../public/styles/style.css';
import '../public/styles/admin.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import ErrorBoundary from '../components/ErrorBoundary';

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
      <SpeedInsights />
      <Analytics />
    </ErrorBoundary>
  );
}
