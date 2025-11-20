import '../public/styles/style.css';
import dynamic from 'next/dynamic';
import ErrorBoundary from '../components/ErrorBoundary';

// Lazy load analytics components to improve initial page load
// These are not needed for first paint, so defer them
const SpeedInsights = dynamic(
  () => import('@vercel/speed-insights/next').then(mod => mod.SpeedInsights),
  { ssr: false }
);

const Analytics = dynamic(
  () => import('@vercel/analytics/next').then(mod => mod.Analytics),
  { ssr: false }
);

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
      <SpeedInsights />
      <Analytics />
    </ErrorBoundary>
  );
}
