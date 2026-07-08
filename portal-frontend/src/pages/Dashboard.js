import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { itemService, messageService, appointmentService } from '../services/api';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MessageIcon from '@mui/icons-material/Message';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openItemDialog, setOpenItemDialog] = useState(false);
    const [openClaimDialog, setOpenClaimDialog] = useState(false);
    const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [messages, setMessages] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterLocation, setFilterLocation] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [newItem, setNewItem] = useState({
      title: '',
      category: '',
      color: '',
      brand: '',
      description: '',
      location: '',
      date: '',
      type: 'lost',
      image: null
    });
    const [claimAnswer, setClaimAnswer] = useState('');
    const [appointment, setAppointment] = useState({
      date: '',
      time: '',
      location: '',
      description: ''
    });

    const itemCardStyles = {
      borderRadius: 3,
      boxShadow: 3,
      p: 1.5,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: 6,
        transform: 'translateY(-4px)'
      }
    };

    const itemImageStyles = {
      width: '100%',
      height: 120,
      objectFit: 'cover',
      borderRadius: 2,
      mb: 1.5
    };

    // Notification state - real data from API
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [openNotificationDialog, setOpenNotificationDialog] = useState(false);

    const [notificationsViewed, setNotificationsViewed] = useState(false);

    const loadNotificationsViewedFromStorage = () => {
      try {
        return localStorage.getItem('lf_notifications_viewed') === 'true';
      } catch (e) {
        return false;
      }
    };

    const setNotificationsViewedInStorage = (val) => {
      try {
        localStorage.setItem('lf_notifications_viewed', val ? 'true' : 'false');
      } catch (e) {
        // ignore
      }
    }

    const loadNotificationsViewedCountFromStorage = () => {
      try {
        return parseInt(localStorage.getItem('lf_notifications_viewed_count'), 10) || 0;
      } catch (e) {
        return 0;
      }
    };

    const setNotificationsViewedCountInStorage = (count) => {
      try {
        localStorage.setItem('lf_notifications_viewed_count', String(count));
      } catch (e) {
        // ignore
      }
    };

    // Dismissed notifications - persist across sessions
    const loadDismissedNotificationsFromStorage = () => {
      try {
        const stored = localStorage.getItem('lf_notifications_dismissed');
        return stored ? JSON.parse(stored) : [];
      } catch (err) {
        return [];
      }
    };

    const saveDismissedNotificationsToStorage = (list) => {
      try {
        localStorage.setItem('lf_notifications_dismissed', JSON.stringify(list));
      } catch (err) {
        console.error('Failed to save dismissed notifications', err);
      }
    };

    const addToDismissedNotifications = (notifIds) => {
      const dismissed = loadDismissedNotificationsFromStorage();
      const updated = [...new Set([...dismissed, ...notifIds])];
      saveDismissedNotificationsToStorage(updated);
    };

// Save notifications to localStorage
    const saveNotificationsToStorage = (list) => {
      try {
        localStorage.setItem('lf_notifications', JSON.stringify(list));
      } catch (err) {
        console.error('Failed to save notifications', err);
      }
    };

    // Load notifications from localStorage
    const loadNotificationsFromStorage = () => {
      try {
        const stored = localStorage.getItem('lf_notifications');
        return stored ? JSON.parse(stored) : [];
      } catch (err) {
        return [];
      }
    };

    // Load notifications
    const loadNotifications = async () => {
      try {
        const dismissedIds = loadDismissedNotificationsFromStorage();
        const storedNotifs = loadNotificationsFromStorage();
        const isAdmin = user?.role === 'admin';

        let notifList = storedNotifs
          .filter(n => !dismissedIds.includes(n.id))
          .map(n => {
            if ((n.type === 'item_pending' || n.type === 'item_posted') && n.id.startsWith('item-')) {
              const message = isAdmin ? 'A user is waiting for approval' : 'Your item is waiting for admin approval';
              return { ...n, type: isAdmin ? 'item_posted' : 'item_pending', message };
            }
            return n;
          });

        // Fetch in parallel to reduce initial load time.
        const [myPostedItemsRes, myClaimsRes, myAppointmentsRes] = await Promise.all([
          itemService.getMyPostedItems(),
          itemService.getMyClaims(),
          appointmentService.getMyAppointments()
        ]);

        const myPostedItems = myPostedItemsRes.data || [];
        const pendingItems = myPostedItems.filter(item => item.status === 'pending');
        const existingPendingIds = notifList
          .filter(n => n.type === 'item_pending' || n.type === 'item_posted')
          .map(n => n.id);

        pendingItems.forEach(item => {
          const notifId = `item-${item.id}`;
          if (!existingPendingIds.includes(notifId) && !dismissedIds.includes(notifId)) {
            const message = isAdmin ? 'A user is waiting for approval' : 'Your item is waiting for admin approval';
            notifList.push({
              id: notifId,
              type: isAdmin ? 'item_posted' : 'item_pending',
              title: item.title,
              message,
              time: item.createdAt
            });
          }
        });

        if (!isAdmin) {
          const approvedItems = myPostedItems.filter(item => item.status === 'lost' || item.status === 'found');
          const existingApprovedIds = storedNotifs.filter(n => n.type === 'item_approved').map(n => n.id);
          approvedItems.forEach(item => {
            const notifId = `item-approved-${item.id}`;
            if (!existingApprovedIds.includes(notifId) && !dismissedIds.includes(notifId)) {
              notifList.push({
                id: notifId,
                type: 'item_approved',
                title: item.title,
                message: `Your item has been APPROVED! Status: ${item.status}`,
                time: item.updatedAt
              });
            }
          });
        }

        const myClaims = myClaimsRes.data || [];
        const existingClaimIds = storedNotifs
          .filter(n => n.type === 'claim_approved' || n.type === 'claim_rejected')
          .map(n => n.id);

        const processedClaims = myClaims.filter(claim =>
          (claim.status === 'approved' || claim.status === 'rejected') &&
          !existingClaimIds.includes(`claim-${claim.id}`) &&
          !dismissedIds.includes(`claim-${claim.id}`)
        );

        processedClaims.forEach(claim => {
          notifList.push({
            id: `claim-${claim.id}`,
            type: claim.status === 'approved' ? 'claim_approved' : 'claim_rejected',
            title: claim.Item?.title || 'Your Claim',
            message: claim.status === 'approved' ? 'Your claim has been APPROVED!' : 'Your claim has been REJECTED',
            time: claim.updatedAt
          });
        });

        const myAppointments = myAppointmentsRes.data || [];
        const existingApptIds = storedNotifs.filter(n => n.type === 'appointment').map(n => n.id);

        myAppointments.forEach(appt => {
          const notifId = `appt-${appt.id}`;
          if (!existingApptIds.includes(notifId) && !dismissedIds.includes(notifId)) {
            notifList.push({
              id: notifId,
              type: 'appointment',
              title: appt.Item?.title || 'CCTV Review',
              message: `Appointment: ${appt.status} - ${appt.date} at ${appt.time}`,
              time: appt.date
            });
          }
        });

        saveNotificationsToStorage(notifList);
        setNotifications(notifList);

        const viewed = loadNotificationsViewedFromStorage();
        const viewedCount = loadNotificationsViewedCountFromStorage();
        const count = viewed ? Math.max(0, notifList.length - viewedCount) : notifList.length;
        setNotificationCount(count);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };

    const deleteAllNotifications = () => {
      try {
        // Add all current notifications to dismissed list
        const notifIds = notifications.map(n => n.id);
        addToDismissedNotifications(notifIds);
        localStorage.removeItem('lf_notifications');
      } catch (err) {
        console.error('Failed to delete notifications', err);
      }
      setNotifications([]);
      setNotificationCount(0);
      setNotificationsViewedInStorage(false);
    };

useEffect(() => {
      // New page load => allow badge to show again until viewed
      setNotificationsViewed(loadNotificationsViewedFromStorage());
      loadItems();
      loadNotifications();
    }, []);

    const [postingItem, setPostingItem] = useState(false);


    const loadItems = async () => {
      try {
        const response = await itemService.getItems();
        setItems(response.data);
      } catch (err) {
        console.error('Failed to load items');
      }
    };

    const loadMessages = async (itemId) => {
      try {
        const response = await messageService.getMessages(itemId);
        setMessages(response.data);
      } catch (err) {
        console.error('Failed to load messages');
      }
    };

    const handleTextChange = (e) => {
      setNewItem({ ...newItem, [e.target.name]: e.target.value });
    };

  const handleFileChange = (e) => {
      setNewItem({ ...newItem, image: e.target.files[0] });
    };

    // Standardized dropdown location options
    const locationOptions = [
      'Library',
      'Computer Laboratory',
      'Science Laboratory',
      'Classroom',
      'Cafeteria',
      'Student Lounge',
      'Registrar Office',
      'Admissions Office',
      'Guidance Office',
      "Dean's Office",
      'Faculty Room',
      'Administration Building',
      'IT Department',
      'Conference Room',
      'Auditorium',
      'Parking Area',
      'Main Gate',
      'Security Office',
      'Elevator Area',
      'Emergency Stairs',
      'Hallway',
      'Restroom',
      'Clinic'
    ];

    const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('title', newItem.title);
  formData.append('category', newItem.category);
  formData.append('color', newItem.color);
  formData.append('brand', newItem.brand);
  formData.append('description', newItem.description);
  formData.append('location', newItem.location);
  formData.append('date', newItem.date);
formData.append('type', newItem.type);
  if (newItem.image) {
    formData.append('image', newItem.image);
  }

try {
    setPostingItem(true);
    await itemService.createItem(formData);
    setOpenDialog(false);
    setNewItem({
      title: '',
      category: '',
      color: '',
      brand: '',
      description: '',
      location: '',
      date: '',
      type: 'lost',
      image: null
    });
    loadItems();
    loadNotifications(); // Reload notifications to show pending item status
  } catch (err) {
    console.error('Failed to create item', err);
  } finally {
    setPostingItem(false);
  }
};

const handleItemClick = (item) => {
      setSelectedItem(item);
      setOpenItemDialog(true);
      loadMessages(item.id);
    };

    // eslint-disable-next-line no-unused-vars
    const handleSendMessage = async () => {
      if (!newMessage.trim() || !selectedItem) return;
      try {
        await messageService.createMessage({
          content: newMessage,
          itemId: selectedItem.id
        });
        setNewMessage('');
        loadMessages(selectedItem.id);
      } catch (err) {
        console.error('Failed to send message');
      }
    };

    const handleClaimSubmit = async () => {
  if (!selectedItem || !claimAnswer.trim()) {
    alert('Please provide an answer to verify your claim');
    return;
  }
  try {
    console.log('Submitting claim for item:', selectedItem.id);
    const response = await itemService.claimItem({
      id: selectedItem.id,
      answer: claimAnswer
    });
    console.log('Claim response:', response.data);
    setOpenClaimDialog(false);
    setClaimAnswer('');
    loadItems();
    alert('Claim submitted successfully! An admin will review your claim.');
  } catch (err) {
    console.error('Claim error details:', err);
    console.error('Response data:', err.response?.data);
    console.error('Status:', err.response?.status);
    const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
    alert(`Failed to submit claim: ${errorMessage}`);
  }
};

const handleAppointmentSubmit = async () => {
      if (!selectedItem) return;
      try {
        await appointmentService.createAppointment({
          ...appointment,
          itemId: selectedItem.id
        });
        setOpenAppointmentDialog(false);
        setAppointment({ date: '', time: '', location: '', description: '' });
        alert('Appointment request submitted!');
        loadNotifications(); // Reload to show new appointment
      } catch (err) {
        console.error('Failed to submit appointment');
      }
    };

    const handleMessageClick = () => {
      if (!user) {
        alert('Please login to message');
        navigate('/login');
        return;
      }
      // Navigate to Chat page with the item pre-selected
      navigate(`/chat?itemId=${selectedItem.id}`);
      setOpenItemDialog(false);
    };

// Filter items for Search and Filters section
    const filteredItems = items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || item.category === filterCategory;
      const matchesLocation = !filterLocation || item.location.toLowerCase().includes(filterLocation.toLowerCase());
      const matchesStatus = !filterStatus || item.status === filterStatus;
      return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
    });

    // Separate items into two groups: Active vs Claimed/Archived
    const activeStatuses = ['pending', 'lost', 'found', 'under_verification'];
    const claimedArchivedStatuses = ['claimed', 'archived'];

    // Apply search/filter to active items only
    const activeItems = filteredItems.filter(item => activeStatuses.includes(item.status));
    const claimedArchivedItems = filteredItems.filter(item => claimedArchivedStatuses.includes(item.status));

const getStatusColor = (status) => {
      switch (status) {
        case 'lost': return 'warning';
        case 'found': return 'warning';
        case 'under_verification': return 'error';
        case 'claimed': return 'info';
        case 'archived': return 'default';
        default: return 'default';
      }
    };

    // Check if item should have ghost (archived/claimed) appearance
    const isGhostItem = (status) => {
      return status === 'archived' || status === 'claimed';
    };

const getImageUrl = (url) => {
  if (!url) return '';
  
  // Full URL already
  if (url.startsWith('http')) return url;
  
  // Use environment variable or fallback to the matching backend host
  const apiUrl = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://ama-clf.onrender.com');
  return `${apiUrl}${url}`;
};

return (
      <Box sx={{ mt: 4, px: 4, '@media (max-width:600px)': { mt: 1 } }}>
        {/* Header Section with Welcome and Notification Button on same row */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2,
            '@media (max-width:600px)': { mb: 1, mt: '20px !important' },
          }}
        >

          <Typography
            variant="h4"
            sx={{
              '@media (max-width:600px)': { mb: 0.5 },
            }}
          >
            Welcome, {user?.displayName || user?.studentId}
          </Typography>
<IconButton 
            color="primary"
onClick={() => {
              setOpenNotificationDialog(true);
              setNotificationsViewed(true);
              setNotificationsViewedInStorage(true);
              setNotificationsViewedCountInStorage(notifications.length);
              setNotificationCount(0); // hide badge after viewing
            }}
            sx={{ 
              backgroundColor: '#f5f5f5',
              '&:hover': { backgroundColor: '#e0e0e0' }
            }}
>
            <Badge badgeContent={notificationCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Box>

        <Box sx={{ mb: 4, mt: 2, '@media (max-width:600px)': { mb: 1.5, mt: 2 } }}>
          <Button variant="contained" onClick={() => setOpenDialog(true)}>
            Post New Item
          </Button>
        </Box>



        {/* Search and Filters */}
        <Box
          sx={{
            mb: 4,
            p: 2,
            backgroundColor: '#f5f5f5',
            borderRadius: 2,
            border: '2px solid #FEE2E2',
            '@media (max-width:600px)': {
              mb: 2,
              p: 1.5,
            },
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              '@media (max-width:600px)': { mb: 1 },
            }}
          >
            Search and Filters
          </Typography>

          <Grid
            container
            spacing={2}
            sx={{
              '@media (max-width:600px)': {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
              },
            }}
          >
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search Keyword"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{
                  '@media (max-width:600px)': {
                    '& .MuiInputBase-root': { minHeight: 34 },
                    '& .MuiInputLabel-root': { fontSize: 14 },
                    '& input': { fontSize: 14, py: '6px' },
                    '& .MuiSvgIcon-root': { fontSize: 18 },
                  },
                }}
              />
            </Grid>


            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                size="small"
                sx={{
                  '@media (max-width:600px)': {
                    '& .MuiInputBase-root': { minHeight: 34 },
                    '& .MuiInputLabel-root': { fontSize: 14 },
                    '& .MuiSelect-select': { fontSize: 14, py: '6px' },
                    '& .MuiSvgIcon-root': { fontSize: 18 },
                  },
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="ID">ID</MenuItem>
                <MenuItem value="Gadget">Gadget</MenuItem>
                <MenuItem value="Wallet">Wallet</MenuItem>
                <MenuItem value="Bag">Bag</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Location"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                size="small"
                sx={{
                  '@media (max-width:600px)': {
                    '& .MuiInputBase-root': { minHeight: 34 },
                    '& .MuiInputLabel-root': { fontSize: 14 },
                    '& .MuiSelect-select': { fontSize: 14, py: '6px' },
                    '& .MuiSvgIcon-root': { fontSize: 18 },
                  },
                }}
              >
                <MenuItem value="">All</MenuItem>
                {locationOptions.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                size="small"
                sx={{
                  '@media (max-width:600px)': {
                    '& .MuiInputBase-root': { minHeight: 34 },
                    '& .MuiInputLabel-root': { fontSize: 14 },
                    '& .MuiSelect-select': { fontSize: 14, py: '6px' },
                    '& .MuiSvgIcon-root': { fontSize: 18 },
                  },
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
                <MenuItem value="found">Found</MenuItem>
                <MenuItem value="under_verification">Under Verification</MenuItem>
                <MenuItem value="claimed">Claimed</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>

        {/* Section 1: Active Lost and Found Items */}
        <Typography
          variant="h5"
          gutterBottom={false}
          sx={{
            mt: { xs: 3, sm: 0 },
            '@media (max-width:600px)': { mt: '24px !important' },
          }}
        >
          Lost and Found Items ({activeItems.length})
        </Typography>




        {/* Desktop/tablet cards */}
        <Grid
          container
          spacing={2}
          sx={{ display: { xs: 'none', md: 'flex' } }}
        >
          {activeItems.map((item) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={2.4}
              key={item.id}
            >
              <Card
                className="card-hover"
                sx={{
                  ...itemCardStyles,
                  opacity: isGhostItem(item.status) ? 0.5 : 1,
                  filter: isGhostItem(item.status) ? 'grayscale(80%)' : 'none',
                  '@media (max-width:600px)': {
                    display: 'none',
                  },
                }}
                onClick={() => handleItemClick(item)}
              >
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                    {item.title}
                  </Typography>
                  {item.imageUrl && (
                    <Box component="img" src={getImageUrl(item.imageUrl)} alt={item.title} sx={itemImageStyles} />
                  )}
                  <Box
                    sx={{
                      width: '100%',
                      backgroundColor: '#ebe3e3',
                      borderRadius: 1,
                      py: 1,
                      px: 2,
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      DETAILS
                    </Typography>
                  </Box>
                  <Box sx={{ px: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Category:</strong> {item.category}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Location:</strong> {item.location}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Date:</strong> {item.date ? new Date(item.date).toLocaleDateString() : ''}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Status:</strong>{' '}
                      <Chip label={item.status} color={getStatusColor(item.status)} size="small" />
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Mobile strict 2-column grid cards */}
        <Box
          sx={{
            display: 'none',
            '@media (max-width:600px)': { display: 'block' },
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '100%', padding: '4px' }}>

            {activeItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                  overflow: 'hidden',
                  opacity: isGhostItem(item.status) ? 0.5 : 1,
                  filter: isGhostItem(item.status) ? 'grayscale(80%)' : 'none',
                  cursor: 'pointer',
                }}
                onClick={() => handleItemClick(item)}
              >
<img
                  src={item.imageUrl ? getImageUrl(item.imageUrl) : item.image}
                  alt={item.title}
                  style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
                />
                    <span style={{ display: 'block', width: '100%', fontSize: '13px', textAlign: 'center', marginTop: '6px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </span>
              </div>
            ))}
          </div>
        </Box>

        {/* Section 2: Claimed/Archived Items */}
        {claimedArchivedItems.length > 0 && (
          <>
            <Typography variant="h5" gutterBottom sx={{ mt: 6 }}>
              Claimed/Archived ({claimedArchivedItems.length})
            </Typography>

{/* Desktop/tablet cards */}
            <Grid container spacing={2}>
              {claimedArchivedItems.map((item) => (
                <Grid item xs={12} sm={6} md={2.4} key={item.id}>
                  <Card
                    className="card-hover"
                    sx={{
                      ...itemCardStyles,
                      opacity: 0.5,
                      filter: 'grayscale(80%)',
                      '@media (max-width:600px)': {
                        display: 'none',
                      },
                    }}
                    onClick={() => handleItemClick(item)}
                  >
                    <CardContent sx={{ p: 1.5 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                        {item.title}
                      </Typography>
                      {item.imageUrl && (
                        <Box component="img" src={getImageUrl(item.imageUrl)} alt={item.title} sx={itemImageStyles} />
                      )}
                      <Box
                        sx={{
                          width: '100%',
                          backgroundColor: '#ebe3e3',
                          borderRadius: 1,
                          py: 1,
                          px: 2,
                          mb: 1
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          DETAILS
                        </Typography>
                      </Box>
                      <Box sx={{ px: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Category:</strong> {item.category}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Location:</strong> {item.location}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Date:</strong> {item.date ? new Date(item.date).toLocaleDateString() : ''}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Status:</strong>{' '}
                          <Chip label={item.status} color={getStatusColor(item.status)} size="small" />
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

        {/* Mobile strict 2-column grid cards */}
        <Box
          sx={{
            display: 'none',
            '@media (max-width:600px)': { display: 'block' },
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '100%', padding: '4px' }}>

                {claimedArchivedItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '100%',
                      overflow: 'hidden',
                      opacity: 0.5,
                      filter: 'grayscale(80%)',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleItemClick(item)}
                  >
                    <img
                      src={item.imageUrl ? getImageUrl(item.imageUrl) : item.image}
                      alt={item.title}
                      style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
                    />
                    <span style={{ display: 'block', width: '100%', fontSize: '13px', textAlign: 'center', marginTop: '6px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>

                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </Box>
          </>
        )}

        {/* Post New Item Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Post New Item</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={newItem.title}
                onChange={handleTextChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Upload Image"
                type="file"
                InputLabelProps={{ shrink: true }}
                onChange={handleFileChange}
                margin="normal"
                accept="image/*"
              />
              <TextField
                fullWidth
                select
                label="Category"
                name="category"
                value={newItem.category}
                onChange={handleTextChange}
                margin="normal"
                required
              >
                <MenuItem value="ID">ID</MenuItem>
                <MenuItem value="Gadget">Gadget</MenuItem>
                <MenuItem value="Wallet">Wallet</MenuItem>
                <MenuItem value="Bag">Bag</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Color"
                name="color"
                value={newItem.color}
                onChange={handleTextChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Brand"
                name="brand"
                value={newItem.brand}
                onChange={handleTextChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={newItem.description}
                onChange={handleTextChange}
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                select
                label="Location"
                name="location"
                value={newItem.location}
                onChange={handleTextChange}
                margin="normal"
                required
              >
                {locationOptions.map((loc) => (
                  <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={newItem.date}
                onChange={handleTextChange}
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                select
                label="Type"
                name="type"
                value={newItem.type}
                onChange={handleTextChange}
                margin="normal"
                required
              >
                <MenuItem value="lost">Lost</MenuItem>
                <MenuItem value="found">Found</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
<Button onClick={handleSubmit} variant="contained" disabled={postingItem}>
                {postingItem ? 'Posting the item...' : 'Submit'}
              </Button>
          </DialogActions>
        </Dialog>

        {/* Item Detail Dialog */}

<Dialog 
  open={openItemDialog} 
  onClose={() => setOpenItemDialog(false)} 
  maxWidth="md" 
  fullWidth
  PaperProps={{
    sx: { minHeight: '80vh' }
  }}
>
  <DialogTitle sx={{ pr: 6 }}>
    {selectedItem?.title}
    <IconButton
      onClick={() => setOpenItemDialog(false)}
      sx={{ position: 'absolute', right: 8, top: 8 }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent dividers>
    {selectedItem && (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {selectedItem.imageUrl && (
            <Box
              component="img"
              src={getImageUrl(selectedItem.imageUrl)}
              alt={selectedItem.title}
              sx={{ width: '100%', borderRadius: 2 }}
            />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              width: '100%',
              backgroundColor: '#ebe3e3',
              borderRadius: 1,
              py: 1,
              px: 2,
              mb: 1
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600}}>DETAILS</Typography>
          </Box>

          <Box sx={{ px: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Category:</strong> {selectedItem.category}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Color:</strong> {selectedItem.color}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Brand:</strong> {selectedItem.brand}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Location:</strong> {selectedItem.location}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Date:</strong> {new Date(selectedItem.date).toLocaleDateString()}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Posted by:</strong>{' '}
              {
                (() => {
                  const postedBy =
                    selectedItem?.postedBy ??
                    selectedItem?.user ??
                    selectedItem?.author ??
                    selectedItem?.User?.displayName ??
                    selectedItem?.User?.studentId ??
                    selectedItem?.User?.author ??
                    selectedItem?.User?.name;

                  const postedByStr =
                    postedBy === null || postedBy === undefined
                      ? ''
                      : String(postedBy).trim();

                  if (!postedByStr || postedByStr.toLowerCase() === 'unknown') {
                    return 'Admin';
                  }

                  // If name includes Unknown, treat as admin.
                  if (postedByStr.toLowerCase().includes('unknown')) {
                    return 'Admin';
                  }

                  const studentId =
                    selectedItem?.studentId ??
                    selectedItem?.User?.studentId;


                  const studentIdStr =
                    studentId === null || studentId === undefined
                      ? ''
                      : String(studentId).trim();

                  if (studentIdStr) {
                    return `${postedByStr} (${studentIdStr})`;
                  }

                  return postedByStr;
                })()
              }
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Status:</strong>{' '}
              <Chip label={selectedItem.status} color={getStatusColor(selectedItem.status)} />
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 600, mt: 2, px: 2 }}>Description</Typography>
          <Box sx={{ 
            px: 2, 
            maxHeight: 150, 
            overflow: 'auto',
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            p: 1,
            mb: 2
          }}>
            <Typography variant="body1" sx={{ px: 1 }}>
              {selectedItem.description || 'No description provided.'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    )}
  </DialogContent>
<DialogActions
    sx={{
      p: 2,
      gap: 1,
      display: 'flex',
      justifyContent: 'space-between',
      '@media (max-width:600px)': {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
        p: '12px 16px',
      },
    }}
  >
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        '@media (max-width:600px)': {
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '100%',
        },
      }}
    >
      <Button
        variant="outlined"
        startIcon={<MessageIcon />}
        onClick={handleMessageClick}
        disabled={selectedItem?.status === 'claimed'}
        sx={{
          width: { xs: '100%', sm: 'auto' },
          minHeight: '44px',
          '@media (max-width:600px)': {
            width: '100%',
          },
          '& .MuiButton-startIcon': {
            mr: 1,
          },
        }}
      >
        Message
      </Button>
    </Box>

    <Box
      sx={{
        display: 'flex',
        gap: 1,
        '@media (max-width:600px)': {
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '100%',
        },
      }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenClaimDialog(true)}
        disabled={selectedItem?.status === 'claimed' || selectedItem?.status === 'archived' || selectedItem?.status === 'pending'}
        sx={{
          width: { xs: '100%', sm: 'auto' },
          minHeight: '44px',
          '@media (max-width:600px)': {
            width: '100%',
          },
        }}
      >
        {selectedItem?.status === 'under_verification' ? 'Claim In Review' : 'Claim Item'}
      </Button>
      <Button
        variant="outlined"
        startIcon={<CalendarMonthIcon />}
        onClick={() => setOpenAppointmentDialog(true)}
        disabled={isGhostItem(selectedItem?.status)}
        sx={{
          width: { xs: '100%', sm: 'auto' },
          minHeight: '44px',
          '@media (max-width:600px)': {
            width: '100%',
          },
        }}
      >
        Schedule CCTV Review
      </Button>
    </Box>
  </DialogActions>
</Dialog>
                
                      {/* Claim Dialog */}
                      <Dialog open={openClaimDialog} onClose={() => setOpenClaimDialog(false)} maxWidth="sm" fullWidth>
                        <DialogTitle>CLAIM ITEM</DialogTitle>
                        <DialogContent>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            Please answer the verification questions to claim this item.
                          </Typography>
                          <Typography variant="body2">
                            1. What exact location did you last see or use the item?
                          </Typography>
                          <Typography variant="body2">
                            2. On what date and approximate time did you lose it?
                          </Typography>
                          <Typography variant="body2">
                            3. What condition was the item in when you lost it?
                          </Typography>
                          <Typography variant="body2">
                            4. Are there any scratches, cracks, stains, or damage? Specify where.
                          </Typography>
                          <Typography variant="body2">
                            5. Does the item have any unique marks (stickers, engravings, initials, tape, dents)?
                          </Typography>
                          <TextField
                            fullWidth
                            label="Answer"
                            value={claimAnswer}
                            onChange={(e) => setClaimAnswer(e.target.value)}
                            multiline
                            rows={3}
                            margin="normal"
                          />
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={() => setOpenClaimDialog(false)}>Cancel</Button>
                          <Button onClick={handleClaimSubmit} variant="contained">Submit Claim</Button>
                        </DialogActions>
                      </Dialog>
                
{/* Appointment Dialog */}
                      <Dialog open={openAppointmentDialog} onClose={() => setOpenAppointmentDialog(false)} maxWidth="sm" fullWidth>
                        <DialogTitle>Schedule CCTV Review</DialogTitle>
                        <DialogContent>
                          <TextField
                            fullWidth
                            label="Date"
                            type="date"
                            value={appointment.date}
                            onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            fullWidth
                            label="Time"
                            type="time"
                            value={appointment.time}
                            onChange={(e) => setAppointment({ ...appointment, time: e.target.value })}
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            fullWidth
                            label="Location"
                            value={appointment.location}
                            onChange={(e) => setAppointment({ ...appointment, location: e.target.value })}
                            margin="normal"
                          />
                          <TextField
                            fullWidth
                            label="Description"
                            value={appointment.description}
                            onChange={(e) => setAppointment({ ...appointment, description: e.target.value })}
                            margin="normal"
                            multiline
                            rows={2}
                          />
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={() => setOpenAppointmentDialog(false)}>Cancel</Button>
                          <Button onClick={handleAppointmentSubmit} variant="contained">Schedule</Button>
                        </DialogActions>
                      </Dialog>

                      {/* Notifications Dialog */}
                      <Dialog open={openNotificationDialog} onClose={() => setOpenNotificationDialog(false)} maxWidth="sm" fullWidth>
                        <DialogTitle sx={{ pr: 6 }}>
                          Notifications
                          <IconButton
                            onClick={() => setOpenNotificationDialog(false)}
                            sx={{ position: 'absolute', right: 8, top: 8 }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </DialogTitle>
                        <DialogContent dividers>
                          {notifications.length === 0 ? (
                            <Typography variant="body1" sx={{ py: 2, textAlign: 'center', color: '#666' }}>
                              No notifications yet
                            </Typography>
                          ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {notifications.map((notif) => (
                                <Box 
                                  key={notif.id}
                                  sx={{ 
                                    p: 2, 
                                    borderRadius: 2, 
backgroundColor: notif.type === 'claim_approved' ? '#E8F5E9' : 
                                                notif.type === 'claim_rejected' ? '#FFEBEE' : 
                                                notif.type === 'appointment' ? '#E3F2FD' :
                                                notif.type === 'item_approved' ? '#E8F5E9' :
                                                notif.type === 'item_posted' ? '#E3F2FD' : '#FFF3E0',
                                    border: '1px solid #ddd'
                                  }}
                                >
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {notif.title}
                                  </Typography>
                                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    {notif.message}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
                                    {new Date(notif.time).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </DialogContent>
                                                <DialogActions sx={{ justifyContent: 'space-between' }}>
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
                        </DialogActions>
                      </Dialog>
                    </Box>
                  );
                };
                
                export default Dashboard;