// public/js/auto-logout.js
// Simple inactivity auto-logout script
// INACTIVITY_LIMIT_MS controls the timeout (milliseconds).
// The script redirects the browser to /logout after inactivity.
// It also pings /keepalive on activity to keep the server session alive.

const INACTIVITY_LIMIT_MS = 2 * 60 * 1000; // 2 minutes (change as needed)
let inactivityTimer = null;

function startInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    // Redirect to server logout when timeout reached
    window.location.href = '/logout';
  }, INACTIVITY_LIMIT_MS);
}

// Optional: ping server to refresh session expiry on activity
function keepServerAlive() {
  fetch('/keepalive', { method: 'GET', credentials: 'include' })
    .catch(() => {
      // ignore network errors
    });
}

// Activity events that reset the timer
['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
  window.addEventListener(evt, () => {
    startInactivityTimer();
    keepServerAlive();
  }, { passive: true });
});

// Start the timer on load
startInactivityTimer();
