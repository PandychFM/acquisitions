import { db } from '#config/database.js';
import logger from '#config/logger.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export const getAllUsers = async () => {
  try {
    return await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      created_at: users.created_at,
      updated_at: users.updated_at,
    }).from(users);

  } catch (e) {
    logger.error('Error fetching all users:', e);
    throw e;
  }
};

export const getUserById = async (id) => {
  try {
    const result = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      created_at: users.created_at,
      updated_at: users.updated_at,
    }).from(users).where(eq(users.id, id));

    if (result.length === 0) {
      throw new Error('User not found');
    }

    return result[0];
  } catch (e) {
    logger.error(`Error fetching user by ID ${id}:`, e);
    throw e;
  }
};

export const updateUser = async (id, updates) => {
  try {
    // First check if user exists
    const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.id, id));
    
    if (existingUser.length === 0) {
      throw new Error('User not found');
    }

    // Prepare update data
    const updateData = { ...updates };
    
    // Hash password if it's being updated
    if (updateData.password) {
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    // Add updated timestamp
    updateData.updated_at = new Date();

    // Perform update
    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    return result[0];
  } catch (e) {
    logger.error(`Error updating user ${id}:`, e);
    throw e;
  }
};

export const deleteUser = async (id) => {
  try {
    // First check if user exists
    const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.id, id));
    
    if (existingUser.length === 0) {
      throw new Error('User not found');
    }

    // Delete the user
    await db.delete(users).where(eq(users.id, id));
    
    return { success: true, message: 'User deleted successfully' };
  } catch (e) {
    logger.error(`Error deleting user ${id}:`, e);
    throw e;
  }
};
