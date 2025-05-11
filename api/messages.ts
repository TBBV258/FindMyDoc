import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        if (req.query.conversationId) {
          // Get messages by conversation ID
          const messages = await storage.getMessagesByConversationId(Number(req.query.conversationId));
          return res.status(200).json(messages);
        }
        
        return res.status(400).json({ error: 'Missing conversationId parameter' });
        
      case 'POST':
        // Create new message
        const result = await storage.createMessage(req.body);
        return res.status(201).json(result);
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling message request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}