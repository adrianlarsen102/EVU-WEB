import { useState, useEffect, useRef } from 'react';

const themes = [
  { name: 'dark', icon: '🌙', label: 'Dark' },
  { name: 'light', icon: '☀️', label: 'Light' },
  { name: 'purple', icon: '💜', label: 'Purple' },
  { name: 'ocean', icon: '🌊', label: 'Ocean' },
  { name: 'forest', icon: '🌲', label: 'Forest' },
  { name: 'sunset', icon: '🌅', label: 'Sunset' },
  { name: 'midnight', icon: '🌃', label: 'Midnight' }
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'dark';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    setShowDropdown(false);
  };

  if (!mounted) return null;

  const currentTheme = themes.find(t => t.name === theme) || themes[0];

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="Change theme"
        style={{
          background: 'var(--card-bg)',
          border: '2px solid var(--primary-color)',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '1.5rem',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 70, 193, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
        }}
      >
        {currentTheme.icon}
      </button>

      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          backgroundColor: 'var(--card-bg)',
          border: '2px solid var(--primary-color)',
          borderRadius: '12px',
          padding: '0.5rem',
          minWidth: '160px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          zIndex: 1000
        }}>
          {themes.map((t) => (
            <button
              key={t.name}
              onClick={() => changeTheme(t.name)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: theme === t.name ? 'var(--primary-color)' : 'transparent',
                color: theme === t.name ? 'white' : 'var(--text-primary)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                marginBottom: t.name === themes[themes.length - 1].name ? 0 : '0.25rem'
              }}
              onMouseOver={(e) => {
                if (theme !== t.name) {
                  e.currentTarget.style.backgroundColor = 'var(--secondary-color)';
                }
              }}
              onMouseOut={(e) => {
                if (theme !== t.name) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{t.icon}</span>
              <span>{t.label}</span>
              {theme === t.name && <span style={{ marginLeft: 'auto' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
