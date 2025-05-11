// This is a mock Firebase implementation for the MVP
// In a real app, we would use actual Firebase SDK

export interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  photoURL?: string;
  points: number;
  subscriptionPlan: 'free' | 'monthly' | 'yearly';
  subscriptionEndDate?: Date;
}

export interface Document {
  id: string;
  userId: string;
  type: string;
  documentNumber: string;
  name: string;
  status: 'active' | 'lost' | 'found';
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  lostAt?: Date;
  lostLocation?: string;
}

export interface LostDocument {
  id: string;
  documentId: string;
  userId: string;
  document: Document;
  user: User;
  lostAt: Date;
  lostLocation?: string;
  description: string;
}

export interface FoundDocument {
  id: string;
  foundBy: string;
  foundLocation: string;
  documentType: string;
  description: string;
  imageUrl?: string;
  foundAt: Date;
  status: 'pending' | 'claimed' | 'unclaimed';
  possibleMatches?: string[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
  imageUrl?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  createdAt: Date;
  documentId?: string;
}

// Mock auth functions
export const authMethods = {
  loginWithEmailAndPassword: async (email: string, password: string): Promise<User> => {
    // In a real app, this would make a request to Firebase Auth
    return {
      id: '1',
      username: 'Carlos',
      email,
      phoneNumber: '+258 84 123 4567',
      points: 75,
      subscriptionPlan: 'free'
    };
  },

  register: async (email: string, password: string, phoneNumber: string): Promise<User> => {
    // In a real app, this would make a request to Firebase Auth
    return {
      id: '1',
      username: email.split('@')[0],
      email,
      phoneNumber,
      points: 0,
      subscriptionPlan: 'free'
    };
  },

  loginWithDemo: async (): Promise<User> => {
    // In a real app, this would use Firebase anonymous auth
    return {
      id: 'demo-user',
      username: 'Demo User',
      email: 'demo@example.com',
      phoneNumber: '+258 00 000 0000',
      points: 20,
      subscriptionPlan: 'free'
    };
  },

  loginWithGoogle: async (): Promise<User> => {
    // In a real app, this would use Firebase Google auth
    return {
      id: 'google-user',
      username: 'Google User',
      email: 'google@example.com',
      phoneNumber: '+258 00 000 0000',
      points: 0,
      subscriptionPlan: 'free'
    };
  },

  logout: async (): Promise<void> => {
    // In a real app, this would sign out the user from Firebase
    return Promise.resolve();
  }
};

// Mock storage functions
export const storageMethods = {
  getDocuments: async (userId: string): Promise<Document[]> => {
    // In a real app, this would fetch documents from Firestore
    return [
      {
        id: '1',
        userId,
        type: 'id_card',
        documentNumber: '12345678910Z',
        name: 'National ID Card',
        status: 'active',
        createdAt: new Date(2023, 0, 1),
        updatedAt: new Date(2023, 0, 1)
      },
      {
        id: '2',
        userId,
        type: 'drivers_license',
        documentNumber: 'DL99887766',
        name: 'Driver\'s License',
        status: 'lost',
        description: 'Lost in Maputo city center',
        createdAt: new Date(2023, 0, 5),
        updatedAt: new Date(2023, 0, 15),
        lostAt: new Date(2023, 0, 15),
        lostLocation: 'Maputo, Mozambique'
      }
    ];
  },

  addDocument: async (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> => {
    // In a real app, this would add a document to Firestore
    const now = new Date();
    return {
      id: Math.random().toString(36).substring(2, 9),
      ...document,
      createdAt: now,
      updatedAt: now
    };
  },

  updateDocument: async (document: Partial<Document> & { id: string }): Promise<Document> => {
    // In a real app, this would update a document in Firestore
    return {
      id: document.id,
      userId: '1',
      type: 'id_card',
      documentNumber: '12345678910Z',
      name: 'National ID Card',
      status: document.status || 'active',
      createdAt: new Date(2023, 0, 1),
      updatedAt: new Date()
    };
  },

  getLostDocuments: async (): Promise<LostDocument[]> => {
    // In a real app, this would fetch lost documents from Firestore
    return [
      {
        id: '1',
        documentId: '3',
        userId: '2',
        lostAt: new Date(2023, 0, 15),
        lostLocation: 'Maputo, Mozambique',
        description: 'Lost in the Maputo Central area on January 15th. The passport belongs to Maria S. with partial ID MZ9876***.',
        document: {
          id: '3',
          userId: '2',
          type: 'passport',
          documentNumber: 'MZ9876543',
          name: 'Passport',
          status: 'lost',
          createdAt: new Date(2022, 11, 1),
          updatedAt: new Date(2023, 0, 15),
          lostAt: new Date(2023, 0, 15),
          lostLocation: 'Maputo, Mozambique'
        },
        user: {
          id: '2',
          username: 'Maria S.',
          email: 'maria@example.com',
          phoneNumber: '+258 84 987 6543',
          points: 40,
          subscriptionPlan: 'free'
        }
      },
      {
        id: '2',
        documentId: '4',
        userId: '3',
        lostAt: new Date(2023, 0, 10),
        lostLocation: 'Beira, Mozambique',
        description: 'Lost at Mercado Central on January 10th. The ID belongs to João M. with partial number 0543***.',
        document: {
          id: '4',
          userId: '3',
          type: 'id_card',
          documentNumber: '0543210987',
          name: 'National ID Card',
          status: 'lost',
          createdAt: new Date(2022, 10, 15),
          updatedAt: new Date(2023, 0, 10),
          lostAt: new Date(2023, 0, 10),
          lostLocation: 'Beira, Mozambique'
        },
        user: {
          id: '3',
          username: 'João M.',
          email: 'joao@example.com',
          phoneNumber: '+258 84 567 8901',
          points: 25,
          subscriptionPlan: 'free'
        }
      }
    ];
  },

  getFoundDocuments: async (): Promise<FoundDocument[]> => {
    // In a real app, this would fetch found documents from Firestore
    return [
      {
        id: '1',
        foundBy: '4',
        foundLocation: 'Maputo Central Market',
        documentType: 'id_card',
        description: 'Found ID card near the main entrance. Name on card starts with A.',
        foundAt: new Date(2023, 0, 18),
        status: 'pending'
      },
      {
        id: '2',
        foundBy: '5',
        foundLocation: 'Matola Bus Terminal',
        documentType: 'drivers_license',
        description: 'Driver\'s license found on seat #23. Name is partially visible.',
        foundAt: new Date(2023, 0, 17),
        status: 'pending'
      }
    ];
  },

  reportLostDocument: async (documentId: string, details: { lostLocation?: string, description?: string }): Promise<void> => {
    // In a real app, this would update the document status in Firestore
    return Promise.resolve();
  },

  reportFoundDocument: async (details: Omit<FoundDocument, 'id' | 'foundAt' | 'status'>): Promise<FoundDocument> => {
    // In a real app, this would add a found document to Firestore
    return {
      id: Math.random().toString(36).substring(2, 9),
      ...details,
      foundAt: new Date(),
      status: 'pending'
    };
  },

  getConversations: async (userId: string): Promise<Conversation[]> => {
    // In a real app, this would fetch conversations from Firestore
    return [
      {
        id: '1',
        participants: [userId, '2'],
        createdAt: new Date(2023, 0, 17),
        documentId: '3'
      }
    ];
  },

  getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    // In a real app, this would fetch messages from Firestore
    return [
      {
        id: '1',
        conversationId,
        senderId: '2',
        text: 'Hello! I saw your lost passport report. I think I may have found it at the Central Market yesterday.',
        timestamp: new Date(2023, 0, 17, 10, 23),
        read: true
      },
      {
        id: '2',
        conversationId,
        senderId: '1',
        text: 'Thank you so much for contacting me! Can you describe it or maybe send a photo of the cover? (don\'t show personal info)',
        timestamp: new Date(2023, 0, 17, 10, 25),
        read: true
      },
      {
        id: '3',
        conversationId,
        senderId: '2',
        text: 'It\'s a blue Mozambique passport. I\'ll send a photo of just the cover. One moment please.',
        timestamp: new Date(2023, 0, 17, 10, 28),
        read: true
      },
      {
        id: '4',
        conversationId,
        senderId: '2',
        text: '',
        imageUrl: 'https://images.unsplash.com/photo-1540126034813-121bf29033d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300',
        timestamp: new Date(2023, 0, 17, 10, 29),
        read: true
      },
      {
        id: '5',
        conversationId,
        senderId: '1',
        text: 'Yes, that looks like mine! Can we arrange to meet at a safe place like the police station to verify and retrieve it?',
        timestamp: new Date(2023, 0, 17, 10, 32),
        read: true
      }
    ];
  },

  sendMessage: async (message: Omit<ChatMessage, 'id' | 'timestamp' | 'read'>): Promise<ChatMessage> => {
    // In a real app, this would add a message to Firestore
    return {
      id: Math.random().toString(36).substring(2, 9),
      ...message,
      timestamp: new Date(),
      read: false
    };
  },

  createConversation: async (participants: string[], documentId?: string): Promise<Conversation> => {
    // In a real app, this would create a conversation in Firestore
    return {
      id: Math.random().toString(36).substring(2, 9),
      participants,
      createdAt: new Date(),
      documentId
    };
  },

  getUser: async (userId: string): Promise<User> => {
    // In a real app, this would fetch a user from Firestore
    if (userId === '2') {
      return {
        id: '2',
        username: 'Maria S.',
        email: 'maria@example.com',
        phoneNumber: '+258 84 987 6543',
        points: 40,
        subscriptionPlan: 'free'
      };
    }
    return {
      id: '1',
      username: 'Carlos',
      email: 'carlos@example.com',
      phoneNumber: '+258 84 123 4567',
      points: 75,
      subscriptionPlan: 'free'
    };
  },

  updateUser: async (userId: string, data: Partial<User>): Promise<User> => {
    // In a real app, this would update a user in Firestore
    return {
      id: userId,
      username: 'Carlos',
      email: 'carlos@example.com',
      phoneNumber: '+258 84 123 4567',
      points: data.points || 75,
      subscriptionPlan: data.subscriptionPlan || 'free',
      subscriptionEndDate: data.subscriptionEndDate
    };
  }
};
