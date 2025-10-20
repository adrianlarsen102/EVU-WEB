/**
 * Fetch with timeout utility
 * Prevents requests from hanging indefinitely
 */

export async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }

    throw error;
  }
}

/**
 * Fetch JSON with timeout
 * Convenience method for JSON responses
 */
export async function fetchJSON(url, options = {}, timeout = 10000) {
  const response = await fetchWithTimeout(url, options, timeout);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export default fetchWithTimeout;
