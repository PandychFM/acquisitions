import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#services/users.service.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/users.validation.js';
import { formatValidationError } from '#utils/format.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users...');

    const allUsers = await getAllUsers();

    res.json({
      message: 'Successfully retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error('Error fetching all users:', e);
    next(e);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    const validationResult = userIdSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationError(validationResult.error),
      });
    }

    const { id } = validationResult.data;
    logger.info(`Getting user by ID: ${id}`);

    const user = await getUserById(id);

    res.json({
      message: 'Successfully retrieved user',
      user,
    });
  } catch (e) {
    logger.error('Error fetching user by ID:', e);

    if (e.message === 'User not found') {
      return res.status(404).json({
        error: 'Not Found',
        message: e.message,
      });
    }

    next(e);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    // Validate ID parameter
    const idValidation = userIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationError(idValidation.error),
      });
    }

    // Validate request body
    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationError(bodyValidation.error),
      });
    }

    const { id } = idValidation.data;
    const updates = bodyValidation.data;
    const requestingUser = req.user;

    logger.info(`User ${requestingUser.email} attempting to update user ${id}`);

    // Authorization checks
    // Users can only update their own information
    if (requestingUser.id !== id && requestingUser.role !== 'admin') {
      logger.warn(
        `User ${requestingUser.email} denied access to update user ${id}`
      );
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own information',
      });
    }

    // Only admins can change roles
    if (updates.role && requestingUser.role !== 'admin') {
      logger.warn(
        `Non-admin user ${requestingUser.email} attempted to change user role`
      );
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can change user roles',
      });
    }

    const updatedUser = await updateUser(id, updates);

    logger.info(`User ${id} updated successfully by ${requestingUser.email}`);

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (e) {
    logger.error('Error updating user:', e);

    if (e.message === 'User not found') {
      return res.status(404).json({
        error: 'Not Found',
        message: e.message,
      });
    }

    if (e.message === 'User with this already exists') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Email already exists',
      });
    }

    next(e);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    const validationResult = userIdSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationError(validationResult.error),
      });
    }

    const { id } = validationResult.data;
    const requestingUser = req.user;

    logger.info(`User ${requestingUser.email} attempting to delete user ${id}`);

    // Authorization checks
    // Users can delete their own account, admins can delete any account
    if (requestingUser.id !== id && requestingUser.role !== 'admin') {
      logger.warn(
        `User ${requestingUser.email} denied access to delete user ${id}`
      );
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own account',
      });
    }

    const result = await deleteUser(id);

    logger.info(`User ${id} deleted successfully by ${requestingUser.email}`);

    res.json({
      message: result.message,
    });
  } catch (e) {
    logger.error('Error deleting user:', e);

    if (e.message === 'User not found') {
      return res.status(404).json({
        error: 'Not Found',
        message: e.message,
      });
    }

    next(e);
  }
};
