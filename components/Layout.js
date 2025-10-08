import { memo, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import CookieConsent from './CookieConsent';

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

        {/* Usercentrics CMP */}
        <script src="https://web.cmp.usercentrics.eu/modules/autoblocker.js" />
        <script
          id="usercentrics-cmp"
          src="https://web.cmp.usercentrics.eu/ui/loader.js"
          data-settings-id="WuiXESJD4K-Ga4"
          async
        />
      </Head>

      <nav className="navbar">
        <div className="container">
          <div className="logo">EVU Gaming</div>
          <ul className="nav-links">
            <li><Link href="/">Servers</Link></li>
            <li><Link href="/join">Join</Link></li>
            <li><Link href="/forum">Forum</Link></li>
            <li><Link href="/support">Support</Link></li>
            <li><Link href="/changelog">Changelog</Link></li>
            <li><Link href="/profile" style={loginStyle}>👤 Login</Link></li>
          </ul>
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
