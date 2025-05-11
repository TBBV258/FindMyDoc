import { User, InsertUser, Document, InsertDocument, LostDocument, InsertLostDocument, FoundDocument, InsertFoundDocument, Chat, InsertChat, Conversation, InsertConversation } from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  
  // Document methods
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUserId(userId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, data: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Lost document methods
  getLostDocuments(): Promise<LostDocument[]>;
  getLostDocument(id: number): Promise<LostDocument | undefined>;
  createLostDocument(lostDocument: InsertLostDocument): Promise<LostDocument>;
  
  // Found document methods
  getFoundDocuments(): Promise<FoundDocument[]>;
  getFoundDocument(id: number): Promise<FoundDocument | undefined>;
  createFoundDocument(foundDocument: InsertFoundDocument): Promise<FoundDocument>;
  
  // Chat/Conversation methods
  getConversationsByUserId(userId: number): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getMessagesByConversationId(conversationId: number): Promise<Chat[]>;
  createMessage(message: InsertChat): Promise<Chat>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private lostDocuments: Map<number, LostDocument>;
  private foundDocuments: Map<number, FoundDocument>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Chat>;
  
  private userId: number;
  private documentId: number;
  private lostDocumentId: number;
  private foundDocumentId: number;
  private conversationId: number;
  private messageId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.lostDocuments = new Map();
    this.foundDocuments = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    
    this.userId = 1;
    this.documentId = 1;
    this.lostDocumentId = 1;
    this.foundDocumentId = 1;
    this.conversationId = 1;
    this.messageId = 1;
    
    // Add demo data
    this.initializeDemoData();
  }

  // Initialize with demo data for the demo account only
  private initializeDemoData() {
    // Create only the demo user
    const demoUser: InsertUser = {
      username: "demo",
      password: "demo123",
      email: "demo@example.com",
      phoneNumber: "+258 84 123 4567",
      points: 25,
      subscriptionPlan: "free"
    };
    this.createUser(demoUser);
    
    // Create only a single demo document
    const idCard: InsertDocument = {
      userId: 1,
      type: "ID Card",
      name: "National ID Card",
      documentNumber: "DEMO12345",
      status: "active"
    };
    this.createDocument(idCard);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = { ...user, ...data, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    
    return updatedUser;
  }

  // Document methods
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.userId === userId
    );
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentId++;
    const now = new Date();
    const document: Document = {
      ...insertDocument,
      id,
      createdAt: insertDocument.createdAt || now,
      updatedAt: insertDocument.updatedAt || now
    };
    
    this.documents.set(id, document);
    return document;
  }
  
  async updateDocument(id: number, data: Partial<Document>): Promise<Document | undefined> {
    const document = await this.getDocument(id);
    
    if (!document) {
      return undefined;
    }
    
    const updatedDocument = { ...document, ...data, updatedAt: new Date() };
    this.documents.set(id, updatedDocument);
    
    // If the document is marked as lost, create a lost document report if it doesn't exist
    if (data.status === "lost" && !this.getLostDocumentByDocumentId(id)) {
      await this.createLostDocument({
        documentId: id,
        userId: document.userId,
        lostAt: new Date(),
        lostLocation: data.lostLocation || "",
        description: data.description || `${document.name} was reported lost.`
      });
    }
    
    return updatedDocument;
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }
  
  // Lost document methods
  async getLostDocuments(): Promise<LostDocument[]> {
    const lostDocs = Array.from(this.lostDocuments.values());
    
    // Populate document and user data for each lost document
    return Promise.all(
      lostDocs.map(async (lostDoc) => {
        const document = await this.getDocument(lostDoc.documentId);
        const user = await this.getUser(lostDoc.userId);
        
        if (!document || !user) {
          throw new Error(`Document or user not found for lost document ${lostDoc.id}`);
        }
        
        return {
          ...lostDoc,
          document,
          user
        };
      })
    );
  }
  
  async getLostDocument(id: number): Promise<LostDocument | undefined> {
    const lostDoc = this.lostDocuments.get(id);
    
    if (!lostDoc) {
      return undefined;
    }
    
    const document = await this.getDocument(lostDoc.documentId);
    const user = await this.getUser(lostDoc.userId);
    
    if (!document || !user) {
      return undefined;
    }
    
    return {
      ...lostDoc,
      document,
      user
    };
  }
  
  private getLostDocumentByDocumentId(documentId: number): LostDocument | undefined {
    return Array.from(this.lostDocuments.values()).find(
      (lostDoc) => lostDoc.documentId === documentId
    );
  }
  
  async createLostDocument(insertLostDocument: InsertLostDocument): Promise<LostDocument> {
    const id = this.lostDocumentId++;
    const lostDocument: LostDocument = {
      ...insertLostDocument,
      id,
      // These will be populated when fetching
      document: {} as Document,
      user: {} as User
    };
    
    this.lostDocuments.set(id, lostDocument);
    
    // Update the document status to lost
    await this.updateDocument(insertLostDocument.documentId, {
      status: "lost",
      lostAt: insertLostDocument.lostAt,
      lostLocation: insertLostDocument.lostLocation
    });
    
    return this.getLostDocument(id) as Promise<LostDocument>;
  }
  
  // Found document methods
  async getFoundDocuments(): Promise<FoundDocument[]> {
    return Array.from(this.foundDocuments.values());
  }
  
  async getFoundDocument(id: number): Promise<FoundDocument | undefined> {
    return this.foundDocuments.get(id);
  }
  
  async createFoundDocument(insertFoundDocument: InsertFoundDocument): Promise<FoundDocument> {
    const id = this.foundDocumentId++;
    const foundDocument: FoundDocument = {
      ...insertFoundDocument,
      id,
      foundAt: insertFoundDocument.foundAt || new Date(),
      status: insertFoundDocument.status || "pending"
    };
    
    this.foundDocuments.set(id, foundDocument);
    
    // Award points to the finder
    const finder = await this.getUser(insertFoundDocument.foundBy);
    if (finder) {
      await this.updateUser(finder.id, {
        points: finder.points + 20 // Award 20 points for reporting a found document
      });
    }
    
    return foundDocument;
  }
  
  // Chat/Conversation methods
  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      (conv) => conv.participants.includes(userId)
    );
  }
  
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }
  
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.conversationId++;
    const conversation: Conversation = {
      ...insertConversation,
      id,
      createdAt: insertConversation.createdAt || new Date()
    };
    
    this.conversations.set(id, conversation);
    return conversation;
  }
  
  async getMessagesByConversationId(conversationId: number): Promise<Chat[]> {
    return Array.from(this.messages.values())
      .filter((msg) => msg.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  async createMessage(insertMessage: InsertChat): Promise<Chat> {
    const id = this.messageId++;
    const message: Chat = {
      ...insertMessage,
      id,
      timestamp: insertMessage.timestamp || new Date(),
      read: insertMessage.read || false
    };
    
    this.messages.set(id, message);
    
    // Update conversation with last message
    const conversation = await this.getConversation(insertMessage.conversationId);
    if (conversation) {
      conversation.lastMessage = message;
      this.conversations.set(conversation.id, conversation);
    }
    
    return message;
  }
}

import { DatabaseStorage } from './storage-db';

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
