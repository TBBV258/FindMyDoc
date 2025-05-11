import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        if (req.query.id) {
          // Get lost document by ID
          const lostDocument = await storage.getLostDocument(Number(req.query.id));
          if (lostDocument) {
            return res.status(200).json(lostDocument);
          }
          return res.status(404).json({ error: 'Lost document not found' });
        } else {
          // Get all lost documents
          const lostDocuments = await storage.getLostDocuments();
          return res.status(200).json(lostDocuments);
        }
        
      case 'POST':
        // Create new lost document report
        const result = await storage.createLostDocument(req.body);
        return res.status(201).json(result);
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling lost document request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}