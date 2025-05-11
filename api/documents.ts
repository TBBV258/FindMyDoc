import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        if (req.query.id) {
          // Get document by ID
          const document = await storage.getDocument(Number(req.query.id));
          if (document) {
            return res.status(200).json(document);
          }
          return res.status(404).json({ error: 'Document not found' });
        } else if (req.query.userId) {
          // Get documents by user ID
          const documents = await storage.getDocumentsByUserId(Number(req.query.userId));
          return res.status(200).json(documents);
        }
        
        return res.status(400).json({ error: 'Missing id or userId parameter' });
        
      case 'POST':
        // Create new document
        const result = await storage.createDocument(req.body);
        return res.status(201).json(result);
        
      case 'PATCH':
        if (!req.query.id) {
          return res.status(400).json({ error: 'Missing id parameter' });
        }
        
        // Update document
        const updated = await storage.updateDocument(Number(req.query.id), req.body);
        if (!updated) {
          return res.status(404).json({ error: 'Document not found' });
        }
        return res.status(200).json(updated);
      
      case 'DELETE':
        if (!req.query.id) {
          return res.status(400).json({ error: 'Missing id parameter' });
        }
        
        // Delete document
        const deleted = await storage.deleteDocument(Number(req.query.id));
        if (!deleted) {
          return res.status(404).json({ error: 'Document not found' });
        }
        return res.status(204).end();
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling document request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}