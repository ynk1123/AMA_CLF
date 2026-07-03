const fs = require('fs');

const dashboardPath = 'c:/users/Tuf Gaming/documents/LF-portal/portal-frontend/src/pages/Dashboard.js';
let s = fs.readFileSync(dashboardPath, 'utf8');

// Replace the computed count line to use localStorage viewed at runtime
// Find: const count = notificationsViewed ? 0 : notifList.length;
const oldLine = '        const count = notificationsViewed ? 0 : notifList.length;\n        setNotificationCount(count);';
const replacement = `        const viewed = (() => {
          try {
            return localStorage.getItem('lf_notifications_viewed') === 'true';
          } catch (e) {
            return false;
          }
        })();
        const count = viewed ? 0 : notifList.length;
        setNotificationCount(count);`;

if (!s.includes(oldLine)) {
  throw new Error('Could not find expected badge count computation block to patch.');
}

s = s.replace(oldLine, replacement);

fs.writeFileSync(dashboardPath, s, 'utf8');
console.log('Patched badge count computation to use localStorage viewed flag at load time.');
