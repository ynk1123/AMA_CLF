  import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton } from '@mui/material';
  import { useAuth } from '../context/AuthContext';
  import { itemService, messageService, appointmentService } from '../services/api';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const Dashboard = () => {
    const { user } = useAuth();
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

    useEffect(() => {
      loadItems();
    }, []);

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
  } catch (err) {
    console.error('Failed to create item', err);
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
      } catch (err) {
        console.error('Failed to submit appointment');
      }
    };

    const filteredItems = items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || item.category === filterCategory;
      const matchesLocation = !filterLocation || item.location.toLowerCase().includes(filterLocation.toLowerCase());
      const matchesStatus = !filterStatus || item.status === filterStatus;
      return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
    });

const getStatusColor = (status) => {
      switch (status) {
        case 'lost': return 'warning';
        case 'found': return 'success';
        case 'under_verification': return 'error';
        case 'claimed': return 'info';
        case 'archived': return 'default';
        default: return 'default';
      }
    };

const getImageUrl = (url) => {
  if (!url) return '';
  
  // Full URL already
  if (url.startsWith('http')) return url;
  
  // Use environment variable or fallback to localhost
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  return `${apiUrl}${url}`;
};

    return (
      <Box sx={{ mt: 4, px: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.displayName || user?.studentId}
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Button variant="contained" onClick={() => setOpenDialog(true)}>
            Post New Item
          </Button>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ mb: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>Search and Filters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search Keyword"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
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
                label="Location"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                size="small"
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

        <Typography variant="h5" gutterBottom>
          Lost and Found Items ({filteredItems.length})
        </Typography>

        <Grid container spacing={3}>
          {filteredItems.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  p: 1.5,
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 6 }
                }}
                onClick={() => handleItemClick(item)}
              >
                <CardContent sx={{ p: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {item.title}
                  </Typography>
{item.imageUrl && (
  <Box
    component="img"
    src={getImageUrl(item.imageUrl)}
    alt={item.title}
    sx={{
      width: '100%',
      height: 200,
      objectFit: 'cover',
      borderRadius: 2,
      mb: 1
    }}
  />
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
                      <strong>Date:</strong> {new Date(item.date).toLocaleDateString()}
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
            <Button onClick={handleSubmit} variant="contained">Submit</Button>
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
  <DialogActions sx={{ p: 2, gap: 1 }}>
    <Button
      variant="contained"
      color="primary"
      onClick={() => setOpenClaimDialog(true)}
      disabled={selectedItem?.status !== 'lost' && selectedItem?.status !== 'found'}
    >
      Claim Item
    </Button>
    <Button
      variant="outlined"
      startIcon={<CalendarMonthIcon />}
      onClick={() => setOpenAppointmentDialog(true)}
    >
      Schedule CCTV Review
    </Button>
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
                    </Box>
                  );
                };
                
                export default Dashboard;