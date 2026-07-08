import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, TextField, MenuItem, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { itemService } from '../services/api';
import MessageIcon from '@mui/icons-material/Message';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const Browse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
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
    'Clinic',
  ];

  const [filterStatus, setFilterStatus] = useState('');

  const itemCardStyles = {
    borderRadius: 3,
    boxShadow: 3,
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      boxShadow: 6,
      transform: 'translateY(-4px)',
    },
  };

  const itemImageStyles = {
    width: '100%',
    height: 120,
    objectFit: 'cover',
    borderRadius: 2,
    mb: 1.5,
  };

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    // Stagger animation on mount
    const timer = setTimeout(() => {
      document.querySelectorAll('.fade-in').forEach((el) => (el.style.opacity = '1'));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const loadItems = async () => {
    try {
      const response = await itemService.getItems();
      setItems(response.data || []);
    } catch (err) {
      console.error('Failed to load items', err);
    }
  };

  const handleItemClick = (item) => {
    console.log('Item clicked, user:', user);
    console.log('User from useAuth:', user);
    setSelectedItem(item);
    setOpenItemDialog(true);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesLocation =
      !filterLocation ||
      item.location.toLowerCase().includes(filterLocation.toLowerCase());
    const matchesStatus = !filterStatus || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'lost':
        return 'warning';
      case 'found':
        return 'warning';
      case 'under_verification':
        return 'error';
      case 'claimed':
        return 'info';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  // Check if item should have ghost (archived/claimed) appearance
  const isGhostItem = (status) => status === 'archived' || status === 'claimed';

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const apiUrl =
      process.env.REACT_APP_API_URL ||
      (window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://ama-clf.onrender.com');
    return `${apiUrl}${url}`;
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 3 }}>
      <Box className="fade-in" sx={{ px: 4, mt: 4, '@media (max-width:600px)': { mt: 1 } }}>

      <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: '#DC2626',
            mb: 1,
            '@media (max-width:600px)': { fontSize: '1.4rem', mb: 0.5 },
          }}
        >
          Browse Items
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, '@media (max-width:600px)': { mb: 2 } }}>
          Find lost items or report found items
        </Typography>


        {/* Filters */}
        <Box
          sx={{
            mb: { xs: 1, sm: 1.5, md: 4 },
            p: 3,
            backgroundColor: '#fff',
            borderRadius: 2,
            border: '2px solid #FEE2E2',
            '@media (max-width:600px)': {
              p: 1.5,
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#DC2626',
              mb: 2,
              '@media (max-width:600px)': { mb: 1 },
            }}
          >
            🔍 Filter Items
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
                label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                placeholder="Search items..."
                sx={{
                  '@media (max-width:600px)': {
                    '& .MuiInputBase-root': { minHeight: 34 },
                    '& .MuiInputLabel-root': { fontSize: 14 },
                    '& input': { fontSize: 14, py: '6px' },
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

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#1A1A2E',
            mb: 1,
            mt: 1,
            '@media (max-width:600px)': { mb: '2 !important', mt: '1 !important' },
          }}
        >
          {filteredItems.length} Items Found
        </Typography>

        {/* Desktop/tablet cards */}
        <Grid
          container
          spacing={2}
          sx={{
            '@media (max-width:600px)': {
              mt: '0 !important',
              mb: '0 !important',
              paddingTop: '0 !important',
            },
          }}
        >


          {filteredItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={2.4} key={item.id}>
              <Card
                className={`card-hover fade-in stagger-${Math.min(index + 1, 4)}`}
                onClick={() => handleItemClick(item)}
                sx={{
                  ...itemCardStyles,
                  opacity: isGhostItem(item.status) ? 0.5 : 1,
                  filter: isGhostItem(item.status) ? 'grayscale(80%)' : 'none',
                  '@media (max-width:600px)': {
                    display: 'none',
                  },
                }}
              >
                <CardContent sx={{ p: 1.5 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      fontSize: '0.9rem',
                    }}
                  >
                    {item.title}
                  </Typography>
                  {item.imageUrl && (
                    <Box
                      component="img"
                      src={getImageUrl(item.imageUrl)}
                      alt={item.title}
                      sx={itemImageStyles}
                    />
                  )}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <LocationOnIcon sx={{ fontSize: 16, color: '#DC2626' }} />
                    <Typography variant="body2" color="text.secondary">
                      {item.location}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mb: 1,
                    }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: 16, color: '#DC2626' }} />
                    <Typography variant="body2" color="text.secondary">
                      {item.date ? new Date(item.date).toLocaleDateString() : ''}
                    </Typography>
                  </Box>
                  <Chip label={item.status} color={getStatusColor(item.status)} size="small" sx={{ fontWeight: 600 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Mobile strict 4-column grid cards */}
        <Box
          sx={{
            display: 'none',
            '@media (max-width:600px)': { display: 'block' },
          }}
        >
          <div
            style={{
display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              width: '100%',
              padding: '4px',
            }}
          >
            {filteredItems.map((item) => (
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
style={{
                    width: '100%',
                    aspectRatio: '1/1',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    display: 'block',
                  }}
                />
                <span
                  style={{
                    display: 'block',
                    width: '100%',
fontSize: '13px',
                    textAlign: 'center',
                    marginTop: '6px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </Box>

        {filteredItems.length === 0 && (
          <Box className="fade-in" sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="text.secondary">
              No items found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your filters
            </Typography>
          </Box>
        )}
      </Box>

      {/* Item Detail Dialog */}
      <Dialog open={openItemDialog} onClose={() => setOpenItemDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pr: 6, fontWeight: 700, color: '#DC2626' }}>
          {selectedItem?.title}
          <IconButton onClick={() => setOpenItemDialog(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
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
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#DC2626', mb: 2 }}>
                  Details
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Category:</strong> {selectedItem.category}
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
                        selectedItem?.User?.studentId;

                      const postedByStr =
                        postedBy === null || postedBy === undefined ? '' : String(postedBy).trim();

                      if (!postedByStr || postedByStr.toLowerCase() === 'unknown') {
                        return 'Admin';
                      }

                      // If backend provides username-like name + studentId fields separately,
                      // prefer formatting: username (studentId)
                      const studentId =
                        selectedItem?.studentId ??
                        selectedItem?.User?.studentId;

                      const studentIdStr =
                        studentId === null || studentId === undefined
                          ? ''
                          : String(studentId).trim();

                      if (studentIdStr && postedByStr && postedByStr.toLowerCase() !== 'admin') {
                        // Blur the ID part visually: keep length by replacing digits with bullets
                        const studentIdBlurred = String(studentIdStr).replace(/\d/g, '•');
                        return `${postedByStr} (${studentIdBlurred})`;
                      }

                      return postedByStr;
                    })()
                  }
                </Typography>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Status:</strong>{' '}
                  <Chip label={selectedItem.status} color={getStatusColor(selectedItem.status)} />
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
                  Description
                </Typography>
                <Box sx={{ p: 2, backgroundColor: '#FEE2E2', borderRadius: 1 }}>
                  <Typography variant="body1">{selectedItem.description || 'No description provided.'}</Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', justifyContent: 'space-between' }}>
            <Button
              variant="contained"
              startIcon={<MessageIcon />}
              onClick={() => {
                if (!user) {
                  alert('Please login to message');
                  return;
                }
                navigate('/chat?itemId=' + selectedItem?.id);
              }}
              disabled={selectedItem?.status === 'claimed'}
              sx={{
                backgroundColor: '#DC2626',
                '&:hover': { backgroundColor: '#B91C1C' },
              }}
            >
              Message
            </Button>
            {!user && <Alert severity="info">Login to claim items</Alert>}
            {user && (selectedItem?.status === 'lost' || selectedItem?.status === 'found') && (
              <Typography variant="body2" color="text.secondary">
                Claim from Dashboard
              </Typography>
            )}
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Browse;

