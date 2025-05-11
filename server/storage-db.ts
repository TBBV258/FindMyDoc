import { 
  User, InsertUser, Document, InsertDocument, 
  LostDocument, InsertLostDocument, FoundDocument, InsertFoundDocument, 
  Chat, InsertChat, Conversation, InsertConversation,
  users, documents, lostDocuments, foundDocuments,
  chats, conversations, userSettings, translations,
  InsertUserSettings, UserSettings, InsertTranslation, Translation
} from "@shared/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { db } from "./db";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Document methods
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.userId, userId));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocument(id: number, data: Partial<Document>): Promise<Document | undefined> {
    const [document] = await db
      .update(documents)
      .set(data)
      .where(eq(documents.id, id))
      .returning();
    return document;
  }

  async deleteDocument(id: number): Promise<boolean> {
    await db.delete(documents).where(eq(documents.id, id));
    // If we got here without error, consider it a success
    return true;
  }

  // Lost document methods
  async getLostDocuments(): Promise<LostDocument[]> {
    const results = await db.select({
      lostDocument: lostDocuments,
      document: documents,
      user: users
    })
    .from(lostDocuments)
    .innerJoin(documents, eq(lostDocuments.documentId, documents.id))
    .innerJoin(users, eq(lostDocuments.userId, users.id));

    return results.map(({ lostDocument, document, user }) => ({
      ...lostDocument,
      document,
      user
    }));
  }

  async getLostDocument(id: number): Promise<LostDocument | undefined> {
    const results = await db.select({
      lostDocument: lostDocuments,
      document: documents,
      user: users
    })
    .from(lostDocuments)
    .innerJoin(documents, eq(lostDocuments.documentId, documents.id))
    .innerJoin(users, eq(lostDocuments.userId, users.id))
    .where(eq(lostDocuments.id, id));

    if (results.length === 0) return undefined;
    
    const { lostDocument, document, user } = results[0];
    return {
      ...lostDocument,
      document,
      user
    };
  }

  async createLostDocument(lostDocument: InsertLostDocument): Promise<LostDocument> {
    const [newLostDoc] = await db.insert(lostDocuments).values(lostDocument).returning();
    
    // Update the document status to 'lost'
    await db
      .update(documents)
      .set({ status: 'lost', lostAt: lostDocument.lostAt, lostLocation: lostDocument.lostLocation })
      .where(eq(documents.id, lostDocument.documentId));
    
    const doc = await this.getDocument(lostDocument.documentId);
    const user = await this.getUser(lostDocument.userId);
    
    return {
      ...newLostDoc,
      document: doc!,
      user: user!
    };
  }

  // Found document methods
  async getFoundDocuments(): Promise<FoundDocument[]> {
    return db.select().from(foundDocuments);
  }

  async getFoundDocument(id: number): Promise<FoundDocument | undefined> {
    const [foundDocument] = await db.select().from(foundDocuments).where(eq(foundDocuments.id, id));
    return foundDocument;
  }

  async createFoundDocument(foundDocument: InsertFoundDocument): Promise<FoundDocument> {
    // If there are possible matches, award points to the finder
    if (foundDocument.possibleMatches && foundDocument.possibleMatches.length > 0) {
      const finder = await this.getUser(foundDocument.foundBy);
      if (finder && finder.points !== null) {
        await this.updateUser(finder.id, { 
          points: finder.points + 50 
        });
      }
    }
    
    // Safely create document with default values properly formatted
    const [newFoundDoc] = await db.insert(foundDocuments).values({
      foundBy: foundDocument.foundBy,
      foundLocation: foundDocument.foundLocation,
      documentType: foundDocument.documentType,
      description: foundDocument.description,
      status: foundDocument.status || 'pending',
      imageUrl: foundDocument.imageUrl || null,
      foundAt: foundDocument.foundAt || new Date(),
      possibleMatches: foundDocument.possibleMatches || null
    }).returning();
    
    return newFoundDoc;
  }

  // Chat/Conversation methods
  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    // We need to use a SQL query that can check if userId is in the JSON array of participants
    const convos = await db.execute<Conversation>(
      `SELECT * FROM conversations WHERE $1 = ANY(participants)`,
      [userId]
    );
    
    const convoWithMessages = await Promise.all(
      convos.map(async (convo) => {
        const messages = await this.getMessagesByConversationId(convo.id);
        // Sort messages by timestamp in descending order
        messages.sort((a, b) => {
          if (!a.timestamp || !b.timestamp) return 0;
          return b.timestamp.getTime() - a.timestamp.getTime();
        });
        
        // Add last message if exists
        if (messages.length > 0) {
          return {
            ...convo,
            lastMessage: messages[0]
          };
        }
        return convo;
      })
    );
    
    return convoWithMessages;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConvo] = await db.insert(conversations).values(conversation).returning();
    return newConvo;
  }

  async getMessagesByConversationId(conversationId: number): Promise<Chat[]> {
    return db
      .select()
      .from(chats)
      .where(eq(chats.conversationId, conversationId))
      .orderBy(desc(chats.timestamp));
  }

  async createMessage(message: InsertChat): Promise<Chat> {
    const [newMessage] = await db.insert(chats).values(message).returning();
    
    // Update the conversation's lastMessage
    await db
      .update(conversations)
      .set({
        lastMessage: newMessage,
        updatedAt: new Date()
      })
      .where(eq(conversations.id, message.conversationId));
    
    return newMessage;
  }

  // User settings methods
  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return settings;
  }

  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const [newSettings] = await db.insert(userSettings).values(settings).returning();
    return newSettings;
  }

  async updateUserSettings(userId: number, data: Partial<UserSettings>): Promise<UserSettings> {
    const [settings] = await db
      .update(userSettings)
      .set(data)
      .where(eq(userSettings.userId, userId))
      .returning();
    return settings;
  }

  // Translation methods
  async getTranslation(key: string): Promise<Translation | undefined> {
    const [translation] = await db.select().from(translations).where(eq(translations.key, key));
    return translation;
  }

  async getAllTranslations(): Promise<Translation[]> {
    return db.select().from(translations);
  }

  async createTranslation(translation: InsertTranslation): Promise<Translation> {
    const [newTranslation] = await db.insert(translations).values(translation).returning();
    return newTranslation;
  }

  async updateTranslation(key: string, data: Partial<Translation>): Promise<Translation> {
    const [translation] = await db
      .update(translations)
      .set(data)
      .where(eq(translations.key, key))
      .returning();
    return translation;
  }
}