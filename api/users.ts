import { NextApiRequest, NextApiResponse } from 'next';
import { db } from './database';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { storage } from '../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        if (req.query.id) {
          // Get user by ID
          const user = await storage.getUser(Number(req.query.id));
          if (user) {
            return res.status(200).json(user);
          }
          return res.status(404).json({ error: 'User not found' });
        } else if (req.query.username) {
          // Get user by username
          const user = await storage.getUserByUsername(String(req.query.username));
          if (user) {
            return res.status(200).json(user);
          }
          return res.status(404).json({ error: 'User not found' });
        }
        
        return res.status(400).json({ error: 'Missing id or username parameter' });
        
      case 'POST':
        // Create new user
        const result = await storage.createUser(req.body);
        return res.status(201).json(result);
        
      case 'PATCH':
        if (!req.query.id) {
          return res.status(400).json({ error: 'Missing id parameter' });
        }
        
        // Update user
        const updated = await storage.updateUser(Number(req.query.id), req.body);
        return res.status(200).json(updated);
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling user request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}