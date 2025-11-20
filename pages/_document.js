import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://cdn.vercel-insights.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://va.vercel-scripts.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.vercel-insights.com" />
        <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />

        {/* Preload critical CSS for faster FCP */}
        <link rel="preload" href="/styles/style.css" as="style" />

        {/* Global stylesheets - main CSS inline critical styles */}
        <link rel="stylesheet" href="/styles/style.css" />
        <link rel="stylesheet" href="/styles/admin.css" media="print" onLoad="this.media='all'; this.onload=null;" />
        <noscript><link rel="stylesheet" href="/styles/admin.css" /></noscript>

        {/* Favicon - SVG preferred, fallback to SVG for ICO */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />

        {/* Meta tags for SEO and performance */}
        <meta name="description" content="EVU Gaming Network - Your home for Minecraft and FiveM servers" />
        <meta name="theme-color" content="#6b46c1" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
