// public/js/auto-logout.js
// Simple inactivity auto-logout script
// INACTIVITY_LIMIT_MS controls the timeout (milliseconds).

const INACTIVITY_LIMIT_MS = process.env && process.env.INACTIVITY_LIMIT_MS ? parseInt(process.env.INACTIVITY_LIMIT_MS) : 2 * 60 * 1000; // 2 minutes
let inactivityTimer = null;

function startInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    window.location.href = '/logout';
  }, INACTIVITY_LIMIT_MS);
}

function keepServerAlive() {
  fetch('/keepalive', { method: 'GET', credentials: 'include' })
    .catch(() => {});
}

// activity events that reset the timer
['click','mousemove','keydown','scroll','touchstart'].forEach(evt => {
  window.addEventListener(evt, () => {
    startInactivityTimer();
    keepServerAlive();
  }, { passive: true });
});

// debug log
console.log('auto-logout initialized, timeout(ms):', INACTIVITY_LIMIT_MS);

startInactivityTimer();
