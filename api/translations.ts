import { NextApiRequest, NextApiResponse } from 'next';
import { defaultTranslations } from '../client/src/lib/language';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        // Return the default translations
        return res.status(200).json(defaultTranslations);
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling translations request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}