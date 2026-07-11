import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Box, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import { adminService, appointmentService } from '../services/api';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

const Admin = () => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [locationStats, setLocationStats] = useState([]);
  const [appointments, setAppointments] = useState([]);
const [pendingClaims, setPendingClaims] = useState([]);
  const [allClaims, setAllClaims] = useState([]);
const [users, setUsers] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  useEffect(() => { loadData(); }, []);
useEffect(() => { if (tabValue === 1) loadPendingClaims(); }, [tabValue]);
  useEffect(() => { if (tabValue === 2) loadUsers(); }, [tabValue]);
  useEffect(() => {
  if (tabValue === 3) {
    // Reload data when clicking Locations tab
    loadData();
  }
}, [tabValue]);
  // Appointments data is loaded with loadData() which runs on initial mount

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
      // Fetch pending claims
      const response = await adminService.getAllPendingClaims();
      setPendingClaims(response.data);
      // Fetch ALL claims (including approved/rejected)
      const allResponse = await adminService.getAllClaims();
      setAllClaims(allResponse.data);
    } catch (err) { console.error('Error loading claims:', err); }
  };

const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      console.log('[Admin] Loading users, calling API...');
      const response = await adminService.getAllUsers();
      console.log('[Admin] Users response:', response.data);
      setUsers(response.data);
    } catch (err) { 
      console.error('[Admin] Error loading users:', err);
      console.error('[Admin] Error response:', err.response);
      const errMsg = err.response?.data?.message || err.message || 'Failed to load users';
      setUsersError(errMsg);
    } finally {
      setUsersLoading(false);
    }
  };

const handleApprove = async (id) => { await adminService.approveItem(id); loadData(); };
  const handleStatusChange = async (id, status) => { await adminService.updateItemStatus(id, status); loadData(); };
  const handleDeleteItem = async (id) => { await adminService.deleteItem(id); loadData(); };
const handleClaimApproval = async (claimId, status) => { await adminService.approveOrRejectClaim(claimId, status); loadPendingClaims(); };
  const handleViewItem = (item) => { setSelectedItem(item); setOpenItemDialog(true); };
  const handleAppointmentStatusChange = async (id, status) => { await appointmentService.updateStatus(id, status); loadData(); };
  
  // User management handlers
  const handleSuspendUser = async (id) => { await adminService.suspendUser(id); loadUsers(); };
  const handleReactivateUser = async (id) => { await adminService.reactivateUser(id); loadUsers(); };
  const handleDeleteUser = async (id) => { await adminService.deleteUser(id); loadUsers(); };

const getStatusColor = (status) => {
    const colors = { lost: 'warning', found: 'warning', pending: 'default', under_verification: 'warning', claimed: 'info', archived: 'default' };
    return colors[status] || 'default';
  };

  const getAppointmentStatusColor = (status) => {
    const colors = { pending: 'warning', approved: 'success', completed: 'info', cancelled: 'error' };
    return colors[status] || 'default';
  };

const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const apiUrl = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://ama-clf.onrender.com');
    return `${apiUrl}${url}`;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
    <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: 28, sm: 32, md: 36 } }}>Admin Dashboard</Typography>


      <Grid container spacing={3} sx={{ mb: 4, display: { xs: 'none', md: 'flex' } }}>
        <Grid item md={2}><Card sx={{ bgcolor: '#1976d2', color: 'white' }}><CardContent><Typography variant="body2">Total Items</Typography><Typography variant="h4">{stats.totalItems || 0}</Typography></CardContent></Card></Grid>
        <Grid item md={2}><Card sx={{ bgcolor: '#ed6c02', color: 'white' }}><CardContent><Typography variant="body2">Lost</Typography><Typography variant="h4">{stats.totalLost || 0}</Typography></CardContent></Card></Grid>
        <Grid item md={2}><Card sx={{ bgcolor: '#2e7d32', color: 'white' }}><CardContent><Typography variant="body2">Claimed</Typography><Typography variant="h4">{stats.totalClaimed || 0}</Typography></CardContent></Card></Grid>
        <Grid item md={2}><Card sx={{ bgcolor: '#757575', color: 'white' }}><CardContent><Typography variant="body2">Archived</Typography><Typography variant="h4">{stats.totalArchived || 0}</Typography></CardContent></Card></Grid>
        <Grid item md={2}><Card sx={{ bgcolor: '#0288d1', color: 'white' }}><CardContent><Typography variant="body2">Users</Typography><Typography variant="h4">{stats.totalUsers || 0}</Typography></CardContent></Card></Grid>
        <Grid item md={2}><Card sx={{ bgcolor: '#f57c00', color: 'white' }}><CardContent><Typography variant="body2">Pending Apt</Typography><Typography variant="h4">{stats.pendingAppointments || 0}</Typography></CardContent></Card></Grid>
      </Grid>

      {/* Mobile: fixed-size responsive stats grid (prevents edge cut-off) */}
      <Box
        sx={{
          mb: 3,
          display: { xs: 'block', md: 'none' },
          overflow: 'hidden',
          width: '100%',
          px: 0.5,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4}>
            <Card sx={{ bgcolor: '#1976d2', color: 'white' }}>
              <CardContent sx={{ py: 1.05 }}>
                <Typography variant="body2" sx={{ fontSize: 12.5, lineHeight: 1.2 }}>Total Items</Typography>
                <Typography variant="h5" sx={{ fontSize: 20, mt: 0.5, lineHeight: 1.1 }}>{stats.totalItems || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: '#ed6c02', color: 'white' }}>
              <CardContent sx={{ py: 1.1 }}>
                <Typography variant="body2" sx={{ fontSize: 12.5, lineHeight: 1.2 }}>Lost</Typography>
                <Typography variant="h5" sx={{ fontSize: 20, mt: 0.5, lineHeight: 1.1 }}>{stats.totalLost || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: '#2e7d32', color: 'white' }}>
              <CardContent sx={{ py: 1.1 }}>
                <Typography variant="body2" sx={{ fontSize: 12.5, lineHeight: 1.2 }}>Claimed</Typography>
                <Typography variant="h5" sx={{ fontSize: 20, mt: 0.5, lineHeight: 1.1 }}>{stats.totalClaimed || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: '#757575', color: 'white' }}>
              <CardContent sx={{ py: 1.1 }}>
                <Typography variant="body2" sx={{ fontSize: 12.5, lineHeight: 1.2 }}>Archived</Typography>
                <Typography variant="h5" sx={{ fontSize: 20, mt: 0.5, lineHeight: 1.1 }}>{stats.totalArchived || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: '#0288d1', color: 'white' }}>
              <CardContent sx={{ py: 1.1 }}>
                <Typography variant="body2" sx={{ fontSize: 12.5, lineHeight: 1.2 }}>Users</Typography>
                <Typography variant="h5" sx={{ fontSize: 20, mt: 0.5, lineHeight: 1.1 }}>{stats.totalUsers || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: '#f57c00', color: 'white' }}>
              <CardContent sx={{ py: 1.1 }}>
                <Typography variant="body2" sx={{ fontSize: 12.5, lineHeight: 1.2 }}>Pending Apt</Typography>
                <Typography variant="h5" sx={{ fontSize: 20, mt: 0.5, lineHeight: 1.1 }}>{stats.pendingAppointments || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>


<Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Items" />
          <Tab label="Claims" />
          <Tab label="Users" />
          <Tab label="Locations" />
          <Tab label="Appointments" />
        </Tabs>
      </Box>

      {/* Mobile touch-friendly navigation tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 3,
          display: { xs: 'block', md: 'none' },
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { width: 0, height: 0 },
          scrollbarWidth: 'none',
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          variant="scrollable"
          scrollButtons={false}
          allowScrollButtonsMobile
          sx={{
            minHeight: 48,
            '& .MuiTabs-indicator': { height: 3 },
            '& .MuiTab-root': { minHeight: 44, minWidth: 80 },
          }}
        >
          <Tab label="Items" value={0} />
          <Tab label="Claims" value={1} />
          <Tab label="Users" value={2} />
          <Tab label="Locations" value={3} />
          <Tab label="Appointments" value={4} />
        </Tabs>
      </Box>




      {tabValue === 0 && (
        <>
          <Typography variant="h5" gutterBottom>All Items</Typography>


          {/* Desktop/tablet table */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Title</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Location</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>By</strong></TableCell>
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
                      <TableCell>
                        {(() => {
                          const studentId = item?.User?.studentId;
                          const displayName = item?.User?.displayName;

                          // Force Admin when missing/blank/Unknown
                          if (
                            studentId === undefined ||
                            studentId === null ||
                            String(studentId).trim() === '' ||
                            studentId === 'Unknown'
                          ) {
                            return 'Admin';
                          }

                          const studentIdStr = String(studentId).trim();
                          const username = displayName ? String(displayName).trim() : '';
                          return username ? `${username} (${studentIdStr})` : studentIdStr;
                        })()}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleViewItem(item)}>
                          <VisibilityIcon />
                        </IconButton>
                        {item.status === 'pending' && (
                          <Button size="small" onClick={() => handleApprove(item.id)}>
                            Approve
                          </Button>
                        )}
                        {item.status !== 'lost' && item.status !== 'found' && (
                          <Button size="small" onClick={() => handleStatusChange(item.id, item.itemType || 'lost')}>
                            Restore
                          </Button>
                        )}
                        {(item.status === 'lost' || item.status === 'found') && (
                          <Button size="small" onClick={() => handleStatusChange(item.id, 'claimed')}>
                            Claim
                          </Button>
                        )}
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
          </Box>

          {/* Mobile cards */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, px: 0 }}>
            {items.map((item) => {
              const studentId = item?.User?.studentId;
              const displayName = item?.User?.displayName;

              const byText = (() => {
                if (
                  studentId === undefined ||
                  studentId === null ||
                  String(studentId).trim() === '' ||
                  studentId === 'Unknown'
                ) {
                  return 'Admin';
                }
                const studentIdStr = String(studentId).trim();
                const username = displayName ? String(displayName).trim() : '';
                return username ? `${username} (${studentIdStr})` : studentIdStr;
              })();

              return (
                <Card key={item.id} sx={{ mb: 2, p: 1.25 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 16, mb: 0.25 }} noWrap>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                        ID: {item.id}
                      </Typography>
                    </Box>
                    <Chip label={item.status} color={getStatusColor(item.status)} size="small" />
                  </Box>

                  <Box sx={{ mt: 1, display: 'grid', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontSize: 14 }}>
                      <strong>Category:</strong> {item.category}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: 14 }}>
                      <strong>Location:</strong> {item.location}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: 14 }}>
                      <strong>By:</strong> {byText}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewItem(item)}
                      sx={{ minHeight: 44, justifyContent: 'flex-start' }}
                    >
                      View
                    </Button>

                    {item.status === 'pending' && (
                      <Button variant="contained" onClick={() => handleApprove(item.id)} sx={{ minHeight: 44 }}>
                        Approve
                      </Button>
                    )}

                    {item.status !== 'lost' && item.status !== 'found' && (
                      <Button variant="outlined" onClick={() => handleStatusChange(item.id, item.itemType || 'lost')} sx={{ minHeight: 44 }}>
                        Restore
                      </Button>
                    )}

                    {(item.status === 'lost' || item.status === 'found') && (
                      <Button variant="outlined" onClick={() => handleStatusChange(item.id, 'claimed')} sx={{ minHeight: 44 }}>
                        Claim
                      </Button>
                    )}

                    <Button variant="outlined" onClick={() => handleStatusChange(item.id, 'archived')} sx={{ minHeight: 44 }}>
                      Archive
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteItem(item.id)}
                      sx={{ minHeight: 44, borderColor: 'error.main' }}
                      startIcon={<DeleteIcon />}
                    >
                      Delete
                    </Button>
                  </Box>
                </Card>
              );
            })}
          </Box>
        </>
      )}

      {tabValue === 1 && (
        <>
          <Typography variant="h5" gutterBottom>Pending Claims</Typography>

          {pendingClaims.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">No pending claims</Typography>
            </Paper>
          ) : (
            <>
              {/* Desktop/tablet table */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell><strong>Claim ID</strong></TableCell>
                        <TableCell><strong>Item</strong></TableCell>
                        <TableCell><strong>Claimed By</strong></TableCell>
                        <TableCell><strong>Answer</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingClaims.map((claim) => (
                        <TableRow key={claim.id} hover>
                          <TableCell>{claim.id}</TableCell>
                          <TableCell>{claim.Item?.title || 'Unknown'}</TableCell>
                          <TableCell>{claim.User?.displayName || claim.User?.studentId || 'Unknown'}</TableCell>
                          <TableCell>{claim.answer || '-'}</TableCell>
                          <TableCell>
                            <Chip label={claim.status} color={claim.status === 'pending' ? 'warning' : 'success'} size="small" />
                          </TableCell>
                          <TableCell>
                            <Button size="small" onClick={() => handleClaimApproval(claim.id, 'approved')} color="success">Approve</Button>
                            <Button size="small" onClick={() => handleClaimApproval(claim.id, 'rejected')} color="error">Reject</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Mobile cards */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                {pendingClaims.map((claim) => {
                  const statusColor = claim.status === 'pending' ? 'warning' : 'success';
                  const claimedBy = claim.User?.displayName || claim.User?.studentId || 'Unknown';

                  return (
                    <Card
                      key={claim.id}
                      sx={{
                        mb: 2,
                        p: 1.5,
                        border: '1px solid rgba(0,0,0,0.06)',
                        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: 17, lineHeight: 1.15 }}>
                            Claim #{claim.id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, fontSize: 14, mt: 0.5 }}>
                            Item: {claim.Item?.title || 'Unknown'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, fontSize: 14, mt: 0.5 }}>
                            Claimed By: {claimedBy}
                          </Typography>
                        </Box>
                        <Chip label={claim.status} color={statusColor} size="small" />
                      </Box>

                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: 14 }}>
                          <strong>Answer:</strong> {claim.answer || '-'}
                        </Typography>
                      </Box>

                      <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Button
                          size="large"
                          variant="contained"
                          color="success"
                          onClick={() => handleClaimApproval(claim.id, 'approved')}
                          sx={{ minHeight: 44, justifyContent: 'flex-start' }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="large"
                          variant="outlined"
                          color="error"
                          onClick={() => handleClaimApproval(claim.id, 'rejected')}
                          sx={{ minHeight: 44, justifyContent: 'flex-start' }}
                        >
                          Reject
                        </Button>
                      </Box>
                    </Card>
                  );
                })}
              </Box>
            </>
          )}

          {/* Show ALL Claims History */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>All Claims History</Typography>

            {allClaims.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">No claims history</Typography>
              </Paper>
            ) : (
              <>
                {/* Desktop/tablet table */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#e0e0e0' }}>
                          <TableCell><strong>Claim ID</strong></TableCell>
                          <TableCell><strong>Item</strong></TableCell>
                          <TableCell><strong>Claimed By</strong></TableCell>
                          <TableCell><strong>Answer</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Date</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {allClaims.map((claim) => (
                          <TableRow key={claim.id} hover>
                            <TableCell>{claim.id}</TableCell>
                            <TableCell>{claim.Item?.title || 'Unknown'}</TableCell>
                            <TableCell>{claim.User?.displayName || claim.User?.studentId || 'Unknown'}</TableCell>
                            <TableCell>{claim.answer || '-'}</TableCell>
                            <TableCell>
                              <Chip
                                label={claim.status}
                                color={claim.status === 'approved' ? 'success' : claim.status === 'rejected' ? 'error' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Mobile cards */}
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  {allClaims.map((claim) => {
                    const claimedBy = claim.User?.displayName || claim.User?.studentId || 'Unknown';
                    const cardStatusColor = claim.status === 'approved' ? 'success' : claim.status === 'rejected' ? 'error' : 'warning';

                    return (
                      <Card key={claim.id} sx={{ mb: 2, p: 1.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>
                              Claim #{claim.id}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, mt: 0.5 }}>
                              Item: {claim.Item?.title || 'Unknown'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, mt: 0.5 }}>
                              Claimed By: {claimedBy}
                            </Typography>
                          </Box>
                          <Chip label={claim.status} color={cardStatusColor} size="small" />
                        </Box>

                        <Box sx={{ mt: 1, display: 'grid', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ fontSize: 14 }}>
                            <strong>Answer:</strong> {claim.answer || '-'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                            Date: {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : '-'}
                          </Typography>
                        </Box>
                      </Card>
                    );
                  })}
                </Box>
              </>
            )}
          </Box>
        </>
      )}

{tabValue === 2 && (
        <>
          <Typography variant="h5" gutterBottom>All Users</Typography>
          {usersLoading ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1">Loading users...</Typography>
            </Paper>
          ) : usersError ? (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#ffebee' }}>
              <Typography variant="h6" color="error">Error loading users</Typography>
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>{usersError}</Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => loadUsers()}>
                Retry
              </Button>
            </Paper>
          ) : users.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">No users found</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                There are no registered users in the system yet.
              </Typography>
              <Button variant="outlined" sx={{ mt: 2 }} onClick={() => loadUsers()}>
                Refresh
              </Button>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead><TableRow sx={{ bgcolor: '#f5f5f5' }}><TableCell><strong>ID</strong></TableCell><TableCell><strong>Student ID</strong></TableCell><TableCell><strong>Name</strong></TableCell><TableCell><strong>Email</strong></TableCell><TableCell><strong>Role</strong></TableCell><TableCell><strong>Status</strong></TableCell><TableCell><strong>Actions</strong></TableCell></TableRow></TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.id}</TableCell><TableCell>{user.studentId}</TableCell><TableCell>{user.displayName}</TableCell><TableCell>{user.email}</TableCell>
                      <TableCell><Chip label={user.role} color={user.role === 'admin' ? 'error' : 'default'} size="small" /></TableCell>
                      <TableCell><Chip label={user.status || 'active'} color={(user.status || 'active') === 'active' ? 'success' : 'warning'} size="small" /></TableCell>
                      <TableCell>
                        {user.role !== 'admin' && (
                          <>
                            {(user.status || 'active') === 'active' ? (
                              <Button size="small" onClick={() => handleSuspendUser(user.id)} color="warning">Suspend</Button>
                            ) : (
                              <Button size="small" onClick={() => handleReactivateUser(user.id)} color="success">Reactivate</Button>
                            )}
                            <Button size="small" onClick={() => handleDeleteUser(user.id)} color="error">Delete</Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {tabValue === 3 && (
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

      {tabValue === 4 && (
        <>
          <Typography variant="h5" gutterBottom>CCTV Review Appointments</Typography>

          {/* Desktop/tablet table */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Time</strong></TableCell>
                    <TableCell><strong>Location</strong></TableCell>
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
                      <TableCell>
                        <Chip label={apt.status} color={getAppointmentStatusColor(apt.status)} size="small" />
                      </TableCell>
                      <TableCell>
                        {apt.status === 'pending' && (
                          <>
                            <Button size="small" onClick={() => handleAppointmentStatusChange(apt.id, 'approved')}>Approve</Button>
                            <Button size="small" onClick={() => handleAppointmentStatusChange(apt.id, 'cancelled')}>Cancel</Button>
                          </>
                        )}
                        {apt.status === 'approved' && (
                          <Button size="small" onClick={() => handleAppointmentStatusChange(apt.id, 'completed')}>Complete</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Mobile cards */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {appointments.map((apt) => {
              const cardStatusColor = getAppointmentStatusColor(apt.status);
              const dateText = apt.date ? new Date(apt.date).toLocaleDateString() : '-';

              return (
                <Card
                  key={apt.id}
                  sx={{
                    mb: 2,
                    p: 1.5,
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1.15 }}>
                        Appointment #{apt.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, fontSize: 14, mt: 0.5 }}>
                        Date: {dateText}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, fontSize: 14, mt: 0.5 }}>
                        Time: {apt.time}
                      </Typography>
                    </Box>
                    <Chip label={apt.status} color={cardStatusColor} size="small" />
                  </Box>

                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: 14, fontWeight: 700 }}>
                      Location: <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>
                        {apt.location}
                      </Typography>
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 1 }}>
                    <Grid container spacing={1}>
                      {apt.status === 'pending' && (
                        <>
                          <Grid item xs={6}>
                            <Button
                              fullWidth
                              size="large"
                              variant="contained"
                              color="success"
                              onClick={() => handleAppointmentStatusChange(apt.id, 'approved')}
                              sx={{ minHeight: 44, justifyContent: 'center' }}
                            >
                              Approve
                            </Button>
                          </Grid>
                          <Grid item xs={6}>
                            <Button
                              fullWidth
                              size="large"
                              variant="outlined"
                              color="error"
                              onClick={() => handleAppointmentStatusChange(apt.id, 'cancelled')}
                              sx={{ minHeight: 44, justifyContent: 'center' }}
                            >
                              Cancel
                            </Button>
                          </Grid>
                        </>
                      )}
                      {apt.status === 'approved' && (
                        <Grid item xs={12}>
                          <Button
                            fullWidth
                            size="large"
                            variant="contained"
                            color="primary"
                            onClick={() => handleAppointmentStatusChange(apt.id, 'completed')}
                            sx={{ minHeight: 44, justifyContent: 'center' }}
                          >
                            Complete
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Card>
              );
            })}
          </Box>
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