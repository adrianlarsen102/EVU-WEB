import { memo, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import CookieConsent from './CookieConsent';
import ThemeToggle from './ThemeToggle';

const Layout = memo(function Layout({ children, title = 'EVU Gaming Network' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loginStyle = useMemo(() => ({
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: '5px'
  }), []);

  const navLinks = useMemo(() => [
    { href: '/', label: 'Servers', icon: '🏠' },
    { href: '/join', label: 'Join', icon: '🎮' },
    { href: '/forum', label: 'Forum', icon: '💬' },
    { href: '/support', label: 'Support', icon: '🎫' },
    { href: '/changelog', label: 'Changelog', icon: '📋' },
    { href: '/status', label: 'Status', icon: '📊' },
    { href: '/search', label: 'Search', icon: '🔍' },
    { href: '/profile', label: 'Login', icon: '👤', style: loginStyle }
  ], [loginStyle]);

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
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="logo">EVU Gaming</div>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <ul className="nav-links">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} style={link.style}>
                    <span className="nav-icon">{link.icon}</span>
                    <span className="nav-label">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Theme Toggle - Shared by both desktop and mobile */}
          <div className="nav-theme-toggle">
            <ThemeToggle />
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="nav-mobile-controls">
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-menu" style={{
            backgroundColor: 'var(--card-bg)',
            borderTop: '1px solid var(--secondary-color)',
            padding: '1rem 0',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div className="container">
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        transition: 'background-color 0.2s',
                        ...(link.style || {})
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--secondary-color)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = link.style?.backgroundColor || 'transparent';
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </nav>

      <main>{children}</main>

      <footer>
        <div className="container">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            padding: '2rem 0'
          }}>
            <div style={{
              display: 'flex',
              gap: '2rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '0.5rem'
            }}>
              <Link href="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Privacy Policy
              </Link>
              <Link href="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Terms & Conditions
              </Link>
              <a href="https://discord.gg/yourserver" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Discord
              </a>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              &copy; 2025 EVU Gaming Network. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <CookieConsent />
    </>
  );
});

export default Layout;
