import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import styles from './AnnouncementBanner.module.css';

/**
 * AnnouncementBanner Component
 *
 * Displays site-wide announcements at the top of pages.
 * Fetches active announcements from the API and shows them as banners.
 *
 * Features:
 * - Type-based styling (info, warning, error, success)
 * - Server-specific targeting (all, minecraft, fivem)
 * - Dismissible banners (stored in localStorage)
 * - Auto-refresh every 5 minutes
 * - Responsive design
 *
 * Usage:
 * ```jsx
 * import AnnouncementBanner from './components/AnnouncementBanner';
 *
 * <AnnouncementBanner target="all" />
 * <AnnouncementBanner target="minecraft" />
 * ```
 */
export default function AnnouncementBanner({ target = 'all' }) {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissedIds, setDismissedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load dismissed announcements from localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem('dismissedAnnouncements');
    if (dismissed) {
      try {
        setDismissedIds(JSON.parse(dismissed));
      } catch (error) {
        console.error('Error parsing dismissed announcements:', error);
      }
    }
  }, []);

  // Fetch announcements
  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const response = await fetch(`/api/announcements?target=${target}`);
        const data = await response.json();

        if (response.ok && data.announcements) {
          setAnnouncements(data.announcements);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();

    // Refresh announcements every 5 minutes
    const interval = setInterval(fetchAnnouncements, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [target]);

  // Dismiss announcement
  const dismissAnnouncement = (id) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
  };

  // Filter out dismissed announcements
  const visibleAnnouncements = announcements.filter(
    (announcement) => !dismissedIds.includes(announcement.id)
  );

  if (loading || visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {visibleAnnouncements.map((announcement) => (
        <div
          key={announcement.id}
          className={`${styles.banner} ${styles[announcement.type]}`}
          role="alert"
          aria-live="polite"
        >
          <div className={styles.content}>
            <div className={styles.icon}>
              {announcement.type === 'info' && 'ℹ️'}
              {announcement.type === 'warning' && '⚠️'}
              {announcement.type === 'error' && '❌'}
              {announcement.type === 'success' && '✅'}
            </div>

            <div className={styles.text}>
              <strong className={styles.title}>{announcement.title}</strong>
              <div
                className={styles.message}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(announcement.message) }}
              />
            </div>

            <button
              className={styles.dismissButton}
              onClick={() => dismissAnnouncement(announcement.id)}
              aria-label="Dismiss announcement"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
