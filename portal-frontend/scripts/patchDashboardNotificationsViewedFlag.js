const fs = require('fs');

const dashboardPath = 'c:/users/Tuf Gaming/documents/LF-portal/portal-frontend/src/pages/Dashboard.js';
let s = fs.readFileSync(dashboardPath, 'utf8');

// 1) Add localStorage viewed flag helpers if missing
if (!s.includes("lf_notifications_viewed")) {
  // Insert after notificationsViewed state
  const marker = "const [notificationsViewed, setNotificationsViewed] = useState(false);";
  const insert = `${marker}\n\n    const loadNotificationsViewedFromStorage = () => {\n      try {\n        return localStorage.getItem('lf_notifications_viewed') === 'true';\n      } catch (e) {\n        return false;\n      }\n    };\n\n    const setNotificationsViewedInStorage = (val) => {\n      try {\n        localStorage.setItem('lf_notifications_viewed', val ? 'true' : 'false');\n      } catch (e) {\n        // ignore\n      }\n    }`;
  s = s.replace(marker, insert);
}

// 2) Initialize notificationsViewed from storage on mount
// Replace: setNotificationsViewed(false);
s = s.replace(
  /setNotificationsViewed\(false\);\s*[\r\n]+loadItems\(\);\s*[\r\n]+loadNotifications\(\);/,
  `setNotificationsViewed(loadNotificationsViewedFromStorage());\n      loadItems();\n      loadNotifications();`
);

// 3) When clicking bell: persist viewed flag and hide badge
// Replace the bell click block:
const bellOld = `onClick={() => {
              setOpenNotificationDialog(true);
              setNotificationsViewed(true);
              setNotificationCount(0); // hide badge after viewing
            }}`;
if (s.includes(bellOld)) {
  s = s.replace(bellOld, `onClick={() => {
              setOpenNotificationDialog(true);
              setNotificationsViewed(true);
              setNotificationsViewedInStorage(true);
              setNotificationCount(0); // hide badge after viewing
            }}`);
}

// 4) When deleting all: also clear viewed flag so badge behaves correctly
s = s.replace(
  /setNotificationCount\(0\);\n    };/,
  `setNotificationCount(0);\n      setNotificationsViewedInStorage(false);\n    };`
);

// 5) When deleting one-by-one: also clear viewed flag
// (If present) after setNotificationCount(count);
s = s.replace(
  /setNotificationCount\(count\);\n        return next;\n      }/ ,
  `setNotificationsViewedInStorage(false);\n        setNotificationCount(count);\n        return next;\n      }`
);

fs.writeFileSync(dashboardPath, s, 'utf8');
console.log('Patched notifications viewed persistence.');
