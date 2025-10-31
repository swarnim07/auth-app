// public/js/auto-logout.js
// Simple auto-logout after 2 minutes of inactivity

const INACTIVITY_LIMIT_MS = 2 * 60 * 1000; // 2 minutes
let inactivityTimer = null;
let lastActivityTime = Date.now();

function startInactivityTimer() {
  clearTimeout(inactivityTimer);
  lastActivityTime = Date.now();
  
  inactivityTimer = setTimeout(() => {
    console.log('Auto-logout: 2 minutes of inactivity detected');
    performAutoLogout();
  }, INACTIVITY_LIMIT_MS);
}

function performAutoLogout() {
  // Destroy session and redirect
  fetch('/logout', { 
    method: 'GET', 
    credentials: 'include' 
  })
  .then(() => {
    window.location.href = '/';
  })
  .catch(() => {
    // If fetch fails, just redirect
    window.location.href = '/';
  });
}

function resetInactivityTimer() {
  startInactivityTimer();
  
  // Send keepalive to server
  fetch('/keepalive', { 
    method: 'GET', 
    credentials: 'include' 
  }).catch(error => {
    console.log('Keepalive failed, redirecting to login');
    window.location.href = '/';
  });
}

// Activity events that reset the timer
const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
activityEvents.forEach(event => {
  document.addEventListener(event, resetInactivityTimer, true);
});

// Check if session is still valid every 30 seconds
function checkSession() {
  fetch('/api/user', { credentials: 'include' })
    .then(response => {
      if (response.status === 401) {
        console.log('Session expired on server');
        window.location.href = '/';
      }
    })
    .catch(() => {
      console.log('Session check failed');
      window.location.href = '/';
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('Auto-logout initialized: 2 minutes timeout');
  startInactivityTimer();
  
  // Check session every 30 seconds
  setInterval(checkSession, 30000);
});

// Handle page focus/blur
window.addEventListener('focus', resetInactivityTimer);
window.addEventListener('blur', () => {
  // Don't reset timer when page loses focus
  console.log('Page lost focus, timer continues');
});

// Handle beforeunload to clean up
window.addEventListener('beforeunload', () => {
  clearTimeout(inactivityTimer);
});
