// Loading Skeleton Components
// Prevents Cumulative Layout Shift (CLS) by reserving space while content loads

export function SkeletonCard({ count = 1 }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="skeleton-card"
          style={{
            background: 'var(--card-bg)',
            borderRadius: '10px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}
        >
          <div
            className="skeleton-title"
            style={{
              height: '24px',
              width: '60%',
              background: 'rgba(107, 70, 193, 0.2)',
              borderRadius: '4px',
              marginBottom: '1rem'
            }}
          />
          <div
            className="skeleton-text"
            style={{
              height: '16px',
              width: '100%',
              background: 'rgba(107, 70, 193, 0.1)',
              borderRadius: '4px',
              marginBottom: '0.5rem'
            }}
          />
          <div
            className="skeleton-text"
            style={{
              height: '16px',
              width: '80%',
              background: 'rgba(107, 70, 193, 0.1)',
              borderRadius: '4px'
            }}
          />
        </div>
      ))}
    </>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="skeleton-list-item"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            background: 'var(--card-bg)',
            borderRadius: '8px',
            marginBottom: '1rem',
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: `${i * 0.1}s`
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(107, 70, 193, 0.2)',
              flexShrink: 0
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                height: '18px',
                width: '70%',
                background: 'rgba(107, 70, 193, 0.2)',
                borderRadius: '4px',
                marginBottom: '0.5rem'
              }}
            />
            <div
              style={{
                height: '14px',
                width: '40%',
                background: 'rgba(107, 70, 193, 0.1)',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: '1rem',
            padding: '1rem',
            background: i % 2 === 0 ? 'var(--card-bg)' : 'transparent',
            borderRadius: '4px',
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: `${i * 0.05}s`
          }}
        >
          <div
            style={{
              height: '16px',
              background: 'rgba(107, 70, 193, 0.2)',
              borderRadius: '4px'
            }}
          />
          <div
            style={{
              height: '16px',
              background: 'rgba(107, 70, 193, 0.1)',
              borderRadius: '4px'
            }}
          />
          <div
            style={{
              height: '16px',
              background: 'rgba(107, 70, 193, 0.1)',
              borderRadius: '4px'
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChangelog({ count = 2 }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="skeleton-changelog"
          style={{
            background: 'var(--card-bg)',
            borderRadius: '10px',
            padding: '2rem',
            marginBottom: '2rem',
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
            minHeight: '300px' // Reserve space
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div
              style={{
                height: '32px',
                width: '150px',
                background: 'rgba(107, 70, 193, 0.3)',
                borderRadius: '4px'
              }}
            />
            <div
              style={{
                height: '24px',
                width: '100px',
                background: 'rgba(107, 70, 193, 0.2)',
                borderRadius: '4px'
              }}
            />
          </div>

          {/* Content sections */}
          {[...Array(3)].map((_, j) => (
            <div key={j} style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  height: '20px',
                  width: '180px',
                  background: 'rgba(107, 70, 193, 0.2)',
                  borderRadius: '4px',
                  marginBottom: '1rem'
                }}
              />
              {[...Array(2)].map((_, k) => (
                <div
                  key={k}
                  style={{
                    height: '16px',
                    width: `${90 - k * 10}%`,
                    background: 'rgba(107, 70, 193, 0.1)',
                    borderRadius: '4px',
                    marginBottom: '0.5rem'
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

// Add global skeleton animation styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `;
  document.head.appendChild(style);
}
