import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Box, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { adminService, appointmentService } from '../services/api';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

const Admin = () => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [locationStats, setLocationStats] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (tabValue === 1) {
      loadPendingClaims();
    }
  }, [tabValue]);

  const loadData = async () => {
    try {
      console.log('Loading data...');
      
      const itemsResponse = await adminService.getAllItems();
      console.log('Items loaded:', itemsResponse.data.length);
      setItems(itemsResponse.data);
      
      const statsResponse = await adminService.getStats();
      console.log('Stats loaded:', statsResponse.data);
      setStats(statsResponse.data);
      
      const locationResponse = await adminService.getLocationStats();
      console.log('Location stats loaded:', locationResponse.data);
      setLocationStats(locationResponse.data);
      
      console.log('Fetching appointments...');
      const appointmentResponse = await appointmentService.getAppointments();
      console.log('Appointments response:', appointmentResponse);
      console.log('Appointments data:', appointmentResponse.data);
      console.log('Appointments count:', appointmentResponse.data?.length || 0);
      setAppointments(appointmentResponse.data);
      
      console.log('All data loaded successfully!');
    } catch (err) {
      console.error('Failed to load data:', err);
      console.error('Error response:', err.response?.data);
    }
  };

  const loadPendingClaims = async () => {
    try {
      const response = await adminService.getPendingClaims();
      setPendingClaims(response.data);
    } catch (err) {
      console.error('Failed to load pending claims:', err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminService.approveItem(id);
      loadData();
    } catch (err) {
      console.error('Failed to approve item');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await adminService.updateItemStatus(id, status);
      loadData();
    } catch (err) {
      console.error('Failed to update status');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await adminService.deleteItem(id);
      loadData();
    } catch (err) {
      console.error('Failed to delete item');
    }
  };

  const handleAppointmentStatusChange = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, status);
      loadData();
    } catch (err) {
      console.error('Failed to update appointment status');
    }
  };

  const handleClaimApproval = async (id, status) => {
    try {
      await adminService.approveClaim({ id, status });
      loadPendingClaims();
      loadData();
    } catch (err) {
      console.error('Failed to update claim status:', err);
    }
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setOpenItemDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'lost': return 'success';
      case 'found': return 'success';
      case 'pending': return 'default';
      case 'under_verification': return 'warning';
      case 'claimed': return 'info';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getAppointmentStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    
    if (url.startsWith('http')) return url;
    
    let filename = url.replace('http://localhost:5000/', '').replace('http://localhost:5000', '');
    
    if (!filename.startsWith('/uploads/')) {
      filename = '/uploads/' + filename.replace('/uploads', '');
    }
    
    return `http://localhost:5000${filename}`;
  };

  const campusLocations = {
    'Library': [14.5995, 120.9842],
    'Cafeteria': [14.5990, 120.9835],
    'Registrar': [14.6000, 120.9850],
    'Parking': [14.5985, 120.9840],
    'Gym': [14.5998, 120.9838],
    'Main Building': [14.6002, 120.9845],
    'Science Building': [14.5992, 120.9855],
    'Admin Building': [14.6005, 120.9840]
  };

  const heatMapData = locationStats.map(stat => {
    const locationKey = Object.keys(campusLocations).find(key => 
      stat.location.toLowerCase().includes(key.toLowerCase())
    );
    return {
      location: stat.location,
      count: parseInt(stat.count) || 1,
      position: locationKey ? campusLocations[locationKey] : [14.5995, 120.9842]
    };
  });

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ backgroundColor: '#1976d2', color: 'white' }}>
            <CardContent>
              <Typography variant="body2">Total Items</Typography>
              <Typography variant="h3">{stats.totalItems || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ backgroundColor: '#ed6c02', color: 'white' }}>
            <CardContent>
              <Typography variant="body2">Lost</Typography>
              <Typography variant="h3">{stats.totalLost || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ backgroundColor: '#2e7d32', color: 'white' }}>
            <CardContent>
              <Typography variant="body2">Claimed</Typography>
              <Typography variant="h3">{stats.totalClaimed || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ backgroundColor: '#757575', color: 'white' }}>
            <CardContent>
              <Typography variant="body2">Archived</Typography>
              <Typography variant="h3">{stats.totalArchived || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ backgroundColor: '#0288d1', color: 'white' }}>
            <CardContent>
              <Typography variant="body2">Total Users</Typography>
              <Typography variant="h3">{stats.totalUsers || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ backgroundColor: '#f57c00', color: 'white' }}>
            <CardContent>
              <Typography variant="body2">Pending Appointments</Typography>
              <Typography variant="h3">{stats.pendingAppointments || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs - CORRECTED ORDER */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Items" />
          <Tab label="Claims" />
          <Tab label="Heat Map" />
          <Tab label="Appointments" />
        </Tabs>
      </Box>

      {/* Items Tab */}
      {tabValue === 0 && (
        <>
          <Typography variant="h5" gutterBottom>
            All Items
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Title</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Posted By</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      <Chip label={item.status} color={getStatusColor(item.status)} size="small" />
                    </TableCell>
                    <TableCell>{item.User?.studentId || 'Unknown'}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleViewItem(item)}>
                        <VisibilityIcon />
                      </IconButton>
                      {item.status === 'pending' && (
                        <Button size="small" onClick={() => handleApprove(item.id)}>
                          Approve
                        </Button>
                      )}
                      {item.status !== 'lost' && (
                        <Button size="small" onClick={() => handleStatusChange(item.id, 'lost')}>
                          Restore
                        </Button>
                      )}
                      <Button size="small" onClick={() => handleStatusChange(item.id, 'claimed')}>
                        Claim
                      </Button>
                      <Button size="small" onClick={() => handleStatusChange(item.id, 'archived')}>
                        Archive
                      </Button>
                      <IconButton size="small" onClick={() => handleDeleteItem(item.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Claims Tab - NEW */}
      {tabValue === 1 && (
        <>
          <Typography variant="h5" gutterBottom>
            Pending Claims
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Item</strong></TableCell>
                  <TableCell><strong>Claimed By</strong></TableCell>
                  <TableCell><strong>Claim Answer</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingClaims.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.User?.studentId}</TableCell>
                    <TableCell>{item.claimAnswer || 'No answer provided'}</TableCell>
                    <TableCell>
                      <Chip label={item.claimStatus} color={item.claimStatus === 'pending' ? 'warning' : 'success'} size="small" />
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleClaimApproval(item.id, 'approved')} color="success">
                        Approve
                      </Button>
                      <Button size="small" onClick={() => handleClaimApproval(item.id, 'rejected')} color="error">
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Heat Map Tab */}
      {tabValue === 2 && (
        <>
          <Typography variant="h5" gutterBottom>
            Location-Based Heat Map
          </Typography>
          <Typography variant="body2" gutterBottom color="text.secondary">
            Red circles indicate areas with high frequency of lost items
          </Typography>
          <Paper sx={{ height: 500, overflow: 'hidden' }}>
            <MapContainer 
              center={[14.5995, 120.9842]} 
              zoom={17} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {heatMapData.map((data, index) => (
                <CircleMarker
                  key={index}
                  center={data.position}
                  radius={Math.min(data.count * 5, 30)}
                  pathOptions={{ 
                    color: data.count > 3 ? '#ff0000' : data.count > 1 ? '#ff6600' : '#ffcc00',
                    fillColor: data.count > 3 ? '#ff0000' : data.count > 1 ? '#ff6600' : '#ffcc00',
                    fillOpacity: 0.6
                  }}
                >
                  <Popup>
                    <Typography variant="body2">
                      <strong>{data.location}</strong><br />
                      Items lost: {data.count}
                    </Typography>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </Paper>

          {/* Location Stats Table */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Location Statistics
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell><strong>Number of Items</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locationStats.map((stat, index) => (
                  <TableRow key={index}>
                    <TableCell>{stat.location}</TableCell>
                    <TableCell>{stat.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

            {/* Appointments Tab */}
      {tabValue === 3 && (
        <>
          <Typography variant="h5" gutterBottom>
            CCTV Review Appointments
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Time</strong></TableCell>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt.id} hover>
                    <TableCell>{apt.id}</TableCell>
                    <TableCell>{new Date(apt.date).toLocaleDateString()}</TableCell>
                    <TableCell>{apt.time}</TableCell>
                    <TableCell>{apt.location}</TableCell>
                    <TableCell>{apt.description}</TableCell>
                    <TableCell>
                      <Chip label={apt.status} color={getAppointmentStatusColor(apt.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      {apt.status === 'pending' && (
                        <>
                          <Button size="small" onClick={() => handleAppointmentStatusChange(apt.id, 'approved')}>
                            Approve
                          </Button>
                          <Button size="small" onClick={() => handleAppointmentStatusChange(apt.id, 'cancelled')}>
                            Cancel
                          </Button>
                        </>
                      )}
                      {apt.status === 'approved' && (
                        <Button size="small" onClick={() => handleAppointmentStatusChange(apt.id, 'completed')}>
                          Mark Complete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Item Detail Dialog */}
      <Dialog open={openItemDialog} onClose={() => setOpenItemDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Item Details
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Grid container spacing={2}>
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
                <Typography variant="h6">{selectedItem.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Category: {selectedItem.category}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Color: {selectedItem.color}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Brand: {selectedItem.brand}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Location: {selectedItem.location}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {new Date(selectedItem.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {selectedItem.status}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  <strong>Description:</strong><br />
                  {selectedItem.description}
                </Typography>
                {selectedItem.claimAnswer && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Claim Answer:
                    </Typography>
                    <Typography variant="body2">
                      {selectedItem.claimAnswer}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenItemDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Admin;