import Head from 'next/head';
import Link from 'next/link';
import CookieConsent from './CookieConsent';

export default function Layout({ children, title = 'EVU Server' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
      </Head>

      <nav className="navbar">
        <div className="container">
          <div className="logo">EVU Server</div>
          <ul className="nav-links">
            <li><Link href="/">Status</Link></li>
            <li><Link href="/join">Join</Link></li>
            <li><Link href="/forum">Forum</Link></li>
            <li><Link href="/changelog">Changelog</Link></li>
            <li><Link href="/profile" style={{ backgroundColor: 'rgba(0, 212, 255, 0.1)', borderRadius: '5px' }}>👤 Login</Link></li>
          </ul>
        </div>
      </nav>

      <main>{children}</main>

      <footer>
        <div className="container">
          <p>&copy; 2024 EVU Server. All rights reserved.</p>
        </div>
      </footer>

      <CookieConsent />
    </>
  );
}
