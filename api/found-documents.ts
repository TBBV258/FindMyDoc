import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        if (req.query.id) {
          // Get found document by ID
          const foundDocument = await storage.getFoundDocument(Number(req.query.id));
          if (foundDocument) {
            return res.status(200).json(foundDocument);
          }
          return res.status(404).json({ error: 'Found document not found' });
        } else {
          // Get all found documents
          const foundDocuments = await storage.getFoundDocuments();
          return res.status(200).json(foundDocuments);
        }
        
      case 'POST':
        // Create new found document report
        const result = await storage.createFoundDocument(req.body);
        return res.status(201).json(result);
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling found document request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}