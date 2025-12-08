import express from 'express';
import { fetchAllUsers, fetchUserById, updateUserById, deleteUserById } from '#controllers/users.controller.js';
import { authenticateToken, requireRole } from '#middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all users (requires authentication)
router.get('/', authenticateToken, requireRole(['admin']) ,fetchAllUsers);

// Get user by ID (requires authentication)
router.get('/:id', authenticateToken, fetchUserById);

// Update user by ID (requires authentication, users can update themselves, admins can update anyone)
router.put('/:id', authenticateToken, updateUserById);

// Delete user by ID (requires authentication, users can delete themselves, admins can delete anyone)
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteUserById);

export default router;
