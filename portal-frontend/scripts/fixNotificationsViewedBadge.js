const fs = require('fs');

const dashboardPath = 'c:/users/Tuf Gaming/documents/LF-portal/portal-frontend/src/pages/Dashboard.js';
let s = fs.readFileSync(dashboardPath, 'utf8');

// 1) useEffect: setNotificationsViewed(false) -> setNotificationsViewed(loadNotificationsViewedFromStorage())
s = s.replace(
  /setNotificationsViewed\(false\);\s*\n\s*loadItems\(\);\s*\n\s*loadNotifications\(\);\s*\n\s*\}, \[\]\);/,
  `setNotificationsViewed(loadNotificationsViewedFromStorage());
      loadItems();
      loadNotifications();
    }, []);`
);

// 2) loadNotifications: replace count computation line
s = s.replace(
  /const count = notificationsViewed \? 0 : notifList\.length;\s*\n\s*setNotificationCount\(count\);/,
  `const viewed = loadNotificationsViewedFromStorage();
        const count = viewed ? 0 : notifList.length;
        setNotificationCount(count);`
);

fs.writeFileSync(dashboardPath, s, 'utf8');
console.log('Fixed badge count computation + initialization from lf_notifications_viewed.');
