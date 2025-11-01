import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Global stylesheets */}
        <link rel="stylesheet" href="/styles/style.css" />
        <link rel="stylesheet" href="/styles/admin.css" />

        {/* Favicon - SVG preferred, fallback to SVG for ICO */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />

        {/* Preconnect to improve loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />

        {/* Meta tags for SEO */}
        <meta name="description" content="EVU Gaming Network - Your home for Minecraft and FiveM servers" />
        <meta name="theme-color" content="#6b46c1" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
