import { useState } from 'react';

const themes = [
  {
    name: 'dark',
    icon: '🌙',
    label: 'Dark',
    description: 'Classic dark purple theme',
    colors: {
      primary: '#00d4ff',
      secondary: '#0a0e27',
      darkBg: '#0f1419',
      cardBg: '#1a1f2e',
      textPrimary: '#ffffff',
      accent: '#ff006e',
      success: '#00ff88'
    }
  },
  {
    name: 'light',
    icon: '☀️',
    label: 'Light',
    description: 'Clean light theme',
    colors: {
      primary: '#0099cc',
      secondary: '#f0f4f8',
      darkBg: '#ffffff',
      cardBg: '#f8f9fa',
      textPrimary: '#1a202c',
      accent: '#e91e63',
      success: '#10b981'
    }
  },
  {
    name: 'purple',
    icon: '💜',
    label: 'Purple',
    description: 'Vibrant purple theme',
    colors: {
      primary: '#a855f7',
      secondary: '#1e1b2e',
      darkBg: '#0d0b14',
      cardBg: '#1a1625',
      textPrimary: '#f3e8ff',
      accent: '#ec4899',
      success: '#a78bfa'
    }
  },
  {
    name: 'ocean',
    icon: '🌊',
    label: 'Ocean',
    description: 'Deep blue ocean theme',
    colors: {
      primary: '#06b6d4',
      secondary: '#0c2d48',
      darkBg: '#021526',
      cardBg: '#03396c',
      textPrimary: '#e0f4f7',
      accent: '#0ea5e9',
      success: '#22d3ee'
    }
  },
  {
    name: 'forest',
    icon: '🌲',
    label: 'Forest',
    description: 'Natural green forest theme',
    colors: {
      primary: '#10b981',
      secondary: '#1a2e1a',
      darkBg: '#0a1f0a',
      cardBg: '#14331c',
      textPrimary: '#d1fae5',
      accent: '#34d399',
      success: '#22c55e'
    }
  }
];

export default function ThemePreview({ currentTheme, onThemeSelect }) {
  const [hoveredTheme, setHoveredTheme] = useState(null);

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
        Theme Preview & Selection
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {themes.map((theme) => (
          <div
            key={theme.name}
            onClick={() => onThemeSelect && onThemeSelect(theme.name)}
            onMouseEnter={() => setHoveredTheme(theme.name)}
            onMouseLeave={() => setHoveredTheme(null)}
            style={{
              background: theme.colors.cardBg,
              border: `2px solid ${currentTheme === theme.name ? theme.colors.primary : 'transparent'}`,
              borderRadius: '12px',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: hoveredTheme === theme.name ? 'scale(1.02)' : 'scale(1)',
              boxShadow: currentTheme === theme.name
                ? `0 8px 24px ${theme.colors.primary}40`
                : '0 4px 12px rgba(0, 0, 0, 0.2)',
              position: 'relative'
            }}
          >
            {/* Current theme badge */}
            {currentTheme === theme.name && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: theme.colors.success,
                color: theme.colors.darkBg,
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                ACTIVE
              </div>
            )}

            {/* Theme header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '2.5rem' }}>{theme.icon}</span>
              <div>
                <h3 style={{
                  color: theme.colors.textPrimary,
                  marginBottom: '0.25rem',
                  fontSize: '1.25rem'
                }}>
                  {theme.label}
                </h3>
                <p style={{
                  color: theme.colors.textPrimary,
                  opacity: 0.7,
                  fontSize: '0.875rem'
                }}>
                  {theme.description}
                </p>
              </div>
            </div>

            {/* Color palette */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontSize: '0.75rem',
                color: theme.colors.textPrimary,
                opacity: 0.6,
                marginBottom: '0.5rem'
              }}>
                Color Palette
              </div>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                {Object.entries(theme.colors).map(([name, color]) => (
                  <div
                    key={name}
                    title={`${name}: ${color}`}
                    style={{
                      width: '40px',
                      height: '40px',
                      background: color,
                      borderRadius: '8px',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'help'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Preview card */}
            <div style={{
              background: theme.colors.darkBg,
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <div style={{
                color: theme.colors.primary,
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                Example Card
              </div>
              <div style={{
                color: theme.colors.textPrimary,
                fontSize: '0.75rem',
                marginBottom: '0.5rem'
              }}>
                This is how content looks in this theme.
              </div>
              <button style={{
                background: theme.colors.primary,
                color: theme.colors.darkBg,
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                Primary Button
              </button>
            </div>

            {/* Select button */}
            {currentTheme !== theme.name && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onThemeSelect && onThemeSelect(theme.name);
                }}
                style={{
                  width: '100%',
                  background: theme.colors.primary,
                  color: theme.colors.darkBg,
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  opacity: hoveredTheme === theme.name ? 1 : 0.8
                }}
              >
                Apply {theme.label} Theme
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Theme customization hint */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: 'var(--card-bg)',
        borderRadius: '12px',
        border: '1px solid var(--primary-color)',
        borderLeft: '4px solid var(--primary-color)'
      }}>
        <div style={{
          color: 'var(--primary-color)',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          fontSize: '1rem'
        }}>
          💡 Pro Tip
        </div>
        <div style={{
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          lineHeight: '1.6'
        }}>
          Themes are applied site-wide and saved to user preferences. You can customize theme colors by editing the CSS variables in <code style={{
            background: 'var(--dark-bg)',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            color: 'var(--primary-color)'
          }}>public/styles/style.css</code>
        </div>
      </div>
    </div>
  );
}
