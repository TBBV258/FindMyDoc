import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        if (req.query.id) {
          // Get conversation by ID
          const conversation = await storage.getConversation(Number(req.query.id));
          if (conversation) {
            return res.status(200).json(conversation);
          }
          return res.status(404).json({ error: 'Conversation not found' });
        } else if (req.query.userId) {
          // Get conversations by user ID
          const conversations = await storage.getConversationsByUserId(Number(req.query.userId));
          return res.status(200).json(conversations);
        }
        
        return res.status(400).json({ error: 'Missing id or userId parameter' });
        
      case 'POST':
        // Create new conversation
        const result = await storage.createConversation(req.body);
        return res.status(201).json(result);
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling conversation request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}