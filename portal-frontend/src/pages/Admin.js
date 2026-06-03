import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Box, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
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

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (tabValue === 1) loadPendingClaims(); }, [tabValue]);
  useEffect(() => {
  if (tabValue === 2) {
    // Reload data when clicking Locations tab
    loadData();
  }
}, [tabValue]);

  const loadData = async () => {
    try {
      const itemsRes = await adminService.getAllItems();
      setItems(itemsRes.data);
      const statsRes = await adminService.getStats();
      setStats(statsRes.data);
      const locationRes = await adminService.getLocationStats();
      setLocationStats(locationRes.data);
      const appointmentRes = await appointmentService.getAppointments();
      setAppointments(appointmentRes.data);
    } catch (err) { console.error('Error:', err); }
  };

  const loadPendingClaims = async () => {
    try {
      const response = await adminService.getPendingClaims();
      setPendingClaims(response.data);
    } catch (err) { console.error('Error:', err); }
  };

  const handleApprove = async (id) => { await adminService.approveItem(id); loadData(); };
  const handleStatusChange = async (id, status) => { await adminService.updateItemStatus(id, status); loadData(); };
  const handleDeleteItem = async (id) => { await adminService.deleteItem(id); loadData(); };
const handleClaimApproval = async (id, status) => { await adminService.approveClaim({ id, status }); loadPendingClaims(); };
  const handleViewItem = (item) => { setSelectedItem(item); setOpenItemDialog(true); };
  const handleAppointmentStatusChange = async (id, status) => { await appointmentService.updateStatus(id, status); loadData(); };

  const getStatusColor = (status) => {
    const colors = { lost: 'success', found: 'success', pending: 'default', under_verification: 'warning', claimed: 'info', archived: 'default' };
    return colors[status] || 'default';
  };

  const getAppointmentStatusColor = (status) => {
    const colors = { pending: 'warning', approved: 'success', completed: 'info', cancelled: 'error' };
    return colors[status] || 'default';
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return 'http://localhost:5000' + url;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} md={2}><Card sx={{ bgcolor: '#1976d2', color: 'white' }}><CardContent><Typography variant="body2">Total Items</Typography><Typography variant="h4">{stats.totalItems || 0}</Typography></CardContent></Card></Grid>
        <Grid item xs={6} md={2}><Card sx={{ bgcolor: '#ed6c02', color: 'white' }}><CardContent><Typography variant="body2">Lost</Typography><Typography variant="h4">{stats.totalLost || 0}</Typography></CardContent></Card></Grid>
        <Grid item xs={6} md={2}><Card sx={{ bgcolor: '#2e7d32', color: 'white' }}><CardContent><Typography variant="body2">Claimed</Typography><Typography variant="h4">{stats.totalClaimed || 0}</Typography></CardContent></Card></Grid>
        <Grid item xs={6} md={2}><Card sx={{ bgcolor: '#757575', color: 'white' }}><CardContent><Typography variant="body2">Archived</Typography><Typography variant="h4">{stats.totalArchived || 0}</Typography></CardContent></Card></Grid>
        <Grid item xs={6} md={2}><Card sx={{ bgcolor: '#0288d1', color: 'white' }}><CardContent><Typography variant="body2">Users</Typography><Typography variant="h4">{stats.totalUsers || 0}</Typography></CardContent></Card></Grid>
        <Grid item xs={6} md={2}><Card sx={{ bgcolor: '#f57c00', color: 'white' }}><CardContent><Typography variant="body2">Pending Apt</Typography><Typography variant="h4">{stats.pendingAppointments || 0}</Typography></CardContent></Card></Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Items" />
          <Tab label="Claims" />
          <Tab label="Locations" />
          <Tab label="Appointments" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <>
          <Typography variant="h5" gutterBottom>All Items</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead><TableRow sx={{ bgcolor: '#f5f5f5' }}><TableCell><strong>ID</strong></TableCell><TableCell><strong>Title</strong></TableCell><TableCell><strong>Category</strong></TableCell><TableCell><strong>Location</strong></TableCell><TableCell><strong>Status</strong></TableCell><TableCell><strong>By</strong></TableCell><TableCell><strong>Actions</strong></TableCell></TableRow></TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.id}</TableCell><TableCell>{item.title}</TableCell><TableCell>{item.category}</TableCell><TableCell>{item.location}</TableCell>
                    <TableCell><Chip label={item.status} color={getStatusColor(item.status)} size="small" /></TableCell>
                    <TableCell>{item.User?.studentId || 'Unknown'}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleViewItem(item)}><VisibilityIcon /></IconButton>
                      {item.status === 'pending' && <Button size="small" onClick={() => handleApprove(item.id)}>Approve</Button>}
                      {item.status !== 'lost' && <Button size="small" onClick={() => handleStatusChange(item.id, 'lost')}>Restore</Button>}
                      <Button size="small" onClick={() => handleStatusChange(item.id, 'claimed')}>Claim</Button>
                      <Button size="small" onClick={() => handleStatusChange(item.id, 'archived')}>Archive</Button>
                      <IconButton size="small" onClick={() => handleDeleteItem(item.id)} color="error"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tabValue === 1 && (
        <>
          <Typography variant="h5" gutterBottom>Pending Claims</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead><TableRow sx={{ bgcolor: '#f5f5f5' }}><TableCell><strong>Item</strong></TableCell><TableCell><strong>Claimed By</strong></TableCell><TableCell><strong>Answer</strong></TableCell><TableCell><strong>Status</strong></TableCell><TableCell><strong>Actions</strong></TableCell></TableRow></TableHead>
              <TableBody>
                {pendingClaims.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.title}</TableCell><TableCell>{item.User?.studentId}</TableCell><TableCell>{item.claimAnswer || '-'}</TableCell>
                    <TableCell><Chip label={item.claimStatus} color={item.claimStatus === 'pending' ? 'warning' : 'success'} size="small" /></TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleClaimApproval(item.id, 'approved')} color="success">Approve</Button>
                      <Button size="small" onClick={() => handleClaimApproval(item.id, 'rejected')} color="error">Reject</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tabValue === 2 && (
        <>
<Typography variant="h5" gutterBottom>Lost Items by Location</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>Most common locations where items are lost</Typography>
          
          {/* Bar Chart */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Bar Chart - Visual</Typography>
            {locationStats
              .sort((a, b) => (b.count || 0) - (a.count || 0))
              .map((stat, index) => {
                const maxCount = Math.max(...locationStats.map(s => s.count || 0), 1);
                const percentage = Math.min(((stat.count || 0) / maxCount) * 100, 100);
                let barColor = '#90caf9';
                if (index === 0) barColor = '#d32f2f';
                else if (index === 1) barColor = '#f57c00';
                else if (index === 2) barColor = '#1976d2';
                return (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>{stat.location}</Typography>
                      <Typography fontWeight="bold">{stat.count || 0} items</Typography>
                    </Box>
                    <Box sx={{ height: 24, bgcolor: '#e0e0e0', borderRadius: 1 }}>
                      <Box sx={{ 
                        height: '100%', 
                        width: percentage + '%', 
                        bgcolor: barColor, 
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        pr: 1,
                        color: 'white',
                        fontSize: 11,
                        fontWeight: 'bold'
                      }}>
                        {stat.count || 0}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
          </Paper>

          {/* Stats Table */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}> Location Statistics</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#1976d2' }}>
                  <TableCell sx={{ color: 'white' }}>#</TableCell>
                  <TableCell sx={{ color: 'white' }}>Location</TableCell>
                  <TableCell sx={{ color: 'white' }}>Items Lost</TableCell>
                  <TableCell sx={{ color: 'white' }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locationStats
                  .sort((a, b) => (b.count || 0) - (a.count || 0))
                  .map((stat, index) => (
                    <TableRow key={index} hover sx={{ bgcolor: index % 2 === 0 ? '#f5f5f5' : 'white' }}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell><strong>{stat.location}</strong></TableCell>
                      <TableCell><Chip label={stat.count || 0} color={index < 3 ? 'error' : 'default'} size="small" /></TableCell>
                      <TableCell>
                        {Math.round(((stat.count || 0) / (locationStats.reduce((sum, s) => sum + (s.count || 0), 0) || 1)) * 100)}%
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Top 3 Hotspots */}
          <Paper sx={{ p: 3, mt: 3, bgcolor: '#fff3e0' }}>
            <Typography variant="h6" gutterBottom> Top 3 Hotspot Locations</Typography>
            <Grid container spacing={2}>
              {locationStats.slice(0, 3).map((stat, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'white', 
                    borderRadius: 2, 
                    textAlign: 'center',
                    border: index === 0 ? '3px solid gold' : index === 1 ? '3px solid silver' : '3px solid #cd7f32'
                  }}>
                    <Typography variant="h4" color={index === 0 ? 'warning.main' : '#666'}>#{index + 1}</Typography>
                    <Typography variant="h6">{stat.location}</Typography>
                    <Typography variant="h4" color="primary">{stat.count || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">items lost</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </>
      )}

      {tabValue === 3 && (
        <>
          <Typography variant="h5" gutterBottom>CCTV Review Appointments</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead><TableRow sx={{ bgcolor: '#f5f5f5' }}><TableCell><strong>ID</strong></TableCell><TableCell><strong>Date</strong></TableCell><TableCell><strong>Time</strong></TableCell><TableCell><strong>Location</strong></TableCell><TableCell><strong>Status</strong></TableCell><TableCell><strong>Actions</strong></TableCell></TableRow></TableHead>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt.id} hover>
                    <TableCell>{apt.id}</TableCell><TableCell>{new Date(apt.date).toLocaleDateString()}</TableCell><TableCell>{apt.time}</TableCell><TableCell>{apt.location}</TableCell>
                    <TableCell><Chip label={apt.status} color={getAppointmentStatusColor(apt.status)} size="small" /></TableCell>
                    <TableCell>
                      {apt.status === 'pending' && <><Button size="small" onClick={() => handleAppointmentStatusChange(apt.id, 'approved')}>Approve</Button><Button size="small" onClick={() => handleAppointmentStatusChange(apt.id, 'cancelled')}>Cancel</Button></>}
                      {apt.status === 'approved' && <Button size="small" onClick={() => handleAppointmentStatusChange(apt.id, 'completed')}>Complete</Button>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Dialog open={openItemDialog} onClose={() => setOpenItemDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Item Details</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {selectedItem.imageUrl && <Box component="img" src={getImageUrl(selectedItem.imageUrl)} alt={selectedItem.title} sx={{ width: '100%', borderRadius: 2 }} />}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">{selectedItem.title}</Typography>
                <Typography variant="body2" color="text.secondary">Category: {selectedItem.category}</Typography>
                <Typography variant="body2" color="text.secondary">Color: {selectedItem.color}</Typography>
                <Typography variant="body2" color="text.secondary">Brand: {selectedItem.brand}</Typography>
                <Typography variant="body2" color="text.secondary">Location: {selectedItem.location}</Typography>
                <Typography variant="body2" color="text.secondary">Date: {new Date(selectedItem.date).toLocaleDateString()}</Typography>
                <Typography variant="body2" color="text.secondary">Status: {selectedItem.status}</Typography>
                <Typography sx={{ mt: 2 }}><strong>Description:</strong><br />{selectedItem.description}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenItemDialog(false)}>Close</Button></DialogActions>
      </Dialog>
    </Container>
  );
};

export default Admin;