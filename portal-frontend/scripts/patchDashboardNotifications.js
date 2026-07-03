const fs = require('fs');

const dashboardPath = 'c:/users/Tuf Gaming/documents/LF-portal/portal-frontend/src/pages/Dashboard.js';
let s = fs.readFileSync(dashboardPath, 'utf8');

function ensureInsertDeleteHandler() {
  if (s.includes('const deleteAllNotifications')) return;

  const anchor = '    const loadNotifications = async () => {';
  const useEffectAnchor = 'useEffect(() => {';

  const i = s.indexOf(useEffectAnchor);
  if (i === -1) throw new Error('Could not find useEffect anchor');

  const insert =
`    const deleteAllNotifications = () => {
      try {
        localStorage.removeItem('lf_notifications');
      } catch (err) {
        console.error('Failed to delete notifications', err);
      }
      setNotifications([]);
      setNotificationCount(0);
    };

`;

  // Insert right before the useEffect block
  s = s.slice(0, i) + insert + s.slice(i);
}

function patchDialogFooter() {
  // Replace the notifications dialog footer
  const oldFooter = `                        <DialogActions>
                          <Button onClick={() => setOpenNotificationDialog(false)}>Close</Button>
                        </DialogActions>`;
  const newFooter = `                        <DialogActions sx={{ justifyContent: 'space-between' }}>
                          <Button
                            onClick={() => {
                              deleteAllNotifications();
                              setOpenNotificationDialog(false);
                            }}
                            color="error"
                            disabled={notifications.length === 0}
                          >
                            Delete
                          </Button>
                          <Button onClick={() => setOpenNotificationDialog(false)}>Close</Button>
                        </DialogActions>`;

  if (!s.includes(oldFooter)) {
    // Fallback: patch a looser variant (whitespace-safe)
    const re = /<DialogActions>\s*<Button onClick=\{\(\)\s*=>\s*setOpenNotificationDialog\(false\)\}>\s*Close\s*<\/Button>\s*<\/DialogActions>/m;
    if (!re.test(s)) throw new Error('Could not find Notifications dialog Close footer');
    s = s.replace(re, newFooter);
  } else {
    s = s.replace(oldFooter, newFooter);
  }
}

ensureInsertDeleteHandler();
patchDialogFooter();

fs.writeFileSync(dashboardPath, s, 'utf8');
console.log('Patched Dashboard.js notifications dialog (Delete button + localStorage clear).');
