const express = require('express');
const { 
  getAllItems, 
  approveItem, 
  updateItemStatus, 
  deleteItem, 
  getAllUsers, 
  deleteUser,
  suspendUser,
  reactivateUser,
  getDashboardStats,
  getLocationStats,
  approveClaim,
  getPendingClaims
} = require('../controllers/adminController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const router = express.Router();

// Item routes
router.get('/items', authenticate, authorizeAdmin, getAllItems);
router.put('/items/:id/approve', authenticate, authorizeAdmin, approveItem);
router.put('/items/:id/status', authenticate, authorizeAdmin, updateItemStatus);
router.delete('/items/:id', authenticate, authorizeAdmin, deleteItem);

// User routes
router.get('/users', authenticate, authorizeAdmin, getAllUsers);
router.delete('/users/:id', authenticate, authorizeAdmin, deleteUser);
router.put('/users/:id/suspend', authenticate, authorizeAdmin, suspendUser);
router.put('/users/:id/reactivate', authenticate, authorizeAdmin, reactivateUser);

// Stats routes
router.get('/stats', authenticate, authorizeAdmin, getDashboardStats);
router.get('/stats/locations', authenticate, authorizeAdmin, getLocationStats);

// Claim verification routes
router.post('/claims/approve', authenticate, authorizeAdmin, approveClaim);
router.get('/claims/pending', authenticate, authorizeAdmin, getPendingClaims);

module.exports = router;
