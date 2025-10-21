import { memo, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import CookieConsent from './CookieConsent';
import ThemeToggle from './ThemeToggle';

const Layout = memo(function Layout({ children, title = 'EVU Gaming Network' }) {
  const loginStyle = useMemo(() => ({
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: '5px'
  }), []);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
        <meta name="description" content="EVU Gaming Network - Minecraft & FiveM Servers" />
      </Head>

      <nav className="navbar">
        <div className="container">
          <div className="logo">EVU Gaming</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <ul className="nav-links">
              <li><Link href="/">Servers</Link></li>
              <li><Link href="/join">Join</Link></li>
              <li><Link href="/forum">Forum</Link></li>
              <li><Link href="/support">Support</Link></li>
              <li><Link href="/changelog">Changelog</Link></li>
              <li><Link href="/search">🔍 Search</Link></li>
              <li><Link href="/profile" style={loginStyle}>👤 Login</Link></li>
            </ul>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer>
        <div className="container">
          <p>&copy; 2025 EVU Gaming Network. All rights reserved.</p>
        </div>
      </footer>

      <CookieConsent />
    </>
  );
});

export default Layout;
