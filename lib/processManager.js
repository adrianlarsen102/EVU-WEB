/**
 * Process Manager - Centralized Event Listener Management
 * Prevents MaxListenersExceeded warnings in development
 */

// Track if cleanup handlers have been registered
let cleanupHandlersRegistered = false;
const cleanupCallbacks = new Set();

/**
 * Register a cleanup callback to run on process termination
 * @param {Function} callback - Function to call on cleanup
 * @returns {Function} Function to unregister the callback
 */
export function registerCleanup(callback) {
  cleanupCallbacks.add(callback);

  // Only register process listeners once
  if (!cleanupHandlersRegistered) {
    cleanupHandlersRegistered = true;

    // Increase max listeners to accommodate all our modules
    process.setMaxListeners(20);

    const cleanup = async () => {
      console.log('Process terminating, running cleanup...');
      for (const cb of cleanupCallbacks) {
        try {
          await cb();
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      }
    };

    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
    process.on('beforeExit', cleanup);

    // For development: cleanup on Next.js hot reload
    if (process.env.NODE_ENV === 'development') {
      if (typeof module !== 'undefined' && module.hot) {
        module.hot.dispose(cleanup);
      }
    }
  }

  // Return unregister function
  return () => {
    cleanupCallbacks.delete(callback);
  };
}

/**
 * Create a managed interval that cleans up automatically
 * @param {Function} callback - Function to call on interval
 * @param {number} ms - Interval in milliseconds
 * @returns {Object} Object with clear() method
 */
export function createManagedInterval(callback, ms) {
  const intervalId = setInterval(callback, ms);

  const unregister = registerCleanup(() => {
    clearInterval(intervalId);
  });

  return {
    clear: () => {
      clearInterval(intervalId);
      unregister();
    },
    id: intervalId
  };
}

/**
 * Create a managed timeout that cleans up automatically
 * @param {Function} callback - Function to call on timeout
 * @param {number} ms - Timeout in milliseconds
 * @returns {Object} Object with clear() method
 */
export function createManagedTimeout(callback, ms) {
  const timeoutId = setTimeout(callback, ms);

  const unregister = registerCleanup(() => {
    clearTimeout(timeoutId);
  });

  return {
    clear: () => {
      clearTimeout(timeoutId);
      unregister();
    },
    id: timeoutId
  };
}
