import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertDocumentSchema,
  insertLostDocumentSchema,
  insertFoundDocumentSchema,
  insertChatSchema,
  insertConversationSchema,
  insertUserSettingsSchema,
  insertTranslationSchema,
} from "@shared/schema";
import { defaultTranslations } from "../client/src/lib/language";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Error creating user" });
      }
    }
  });

  app.post("/api/users/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error during login" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  // Document routes
  app.get("/api/documents", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const documents = await storage.getDocumentsByUserId(userId);
      res.status(200).json(documents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching documents" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Error creating document" });
      }
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.status(200).json(document);
    } catch (error) {
      res.status(500).json({ message: "Error fetching document" });
    }
  });

  app.put("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const documentData = req.body;
      
      const updatedDocument = await storage.updateDocument(documentId, documentData);
      
      if (!updatedDocument) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.status(200).json(updatedDocument);
    } catch (error) {
      res.status(500).json({ message: "Error updating document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const success = await storage.deleteDocument(documentId);
      
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting document" });
    }
  });

  // Lost document routes
  app.get("/api/lost-documents", async (req, res) => {
    try {
      const lostDocuments = await storage.getLostDocuments();
      res.status(200).json(lostDocuments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching lost documents" });
    }
  });

  app.post("/api/lost-documents", async (req, res) => {
    try {
      const lostDocumentData = insertLostDocumentSchema.parse(req.body);
      const lostDocument = await storage.createLostDocument(lostDocumentData);
      res.status(201).json(lostDocument);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Error creating lost document report" });
      }
    }
  });

  // Found document routes
  app.get("/api/found-documents", async (req, res) => {
    try {
      const foundDocuments = await storage.getFoundDocuments();
      res.status(200).json(foundDocuments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching found documents" });
    }
  });

  app.post("/api/found-documents", async (req, res) => {
    try {
      const foundDocumentData = insertFoundDocumentSchema.parse(req.body);
      const foundDocument = await storage.createFoundDocument(foundDocumentData);
      res.status(201).json(foundDocument);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Error creating found document report" });
      }
    }
  });

  // Chat/Conversation routes
  app.get("/api/conversations", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const conversations = await storage.getConversationsByUserId(userId);
      res.status(200).json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const conversationData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(conversationData);
      res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Error creating conversation" });
      }
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getMessagesByConversationId(conversationId);
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertChatSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Error sending message" });
      }
    }
  });

  // Subscription routes
  app.post("/api/subscriptions", async (req, res) => {
    try {
      const { userId, planId, endDate } = req.body;
      
      if (!userId || !planId) {
        return res.status(400).json({ message: "User ID and plan ID are required" });
      }
      
      const user = await storage.getUser(parseInt(userId));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(parseInt(userId), {
        subscriptionPlan: planId,
        subscriptionEndDate: endDate || null
      });
      
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Error updating subscription" });
    }
  });
  
  // User settings routes
  app.get("/api/user-settings/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const settings = await storage.getUserSettings(userId);
      
      if (!settings) {
        return res.status(404).json({ message: "User settings not found" });
      }
      
      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user settings" });
    }
  });
  
  app.post("/api/user-settings", async (req, res) => {
    try {
      const settingsData = insertUserSettingsSchema.parse(req.body);
      const settings = await storage.createUserSettings(settingsData);
      res.status(201).json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Error creating user settings" });
      }
    }
  });
  
  app.put("/api/user-settings/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const settingsData = req.body;
      
      const settings = await storage.updateUserSettings(userId, settingsData);
      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ message: "Error updating user settings" });
    }
  });
  
  // Translation routes
  app.get("/api/translations", async (req, res) => {
    try {
      // First attempt to get translations from database
      const translations = await storage.getAllTranslations();
      
      // If no translations in database, return default ones
      if (!translations || translations.length === 0) {
        return res.status(200).json(defaultTranslations);
      }
      
      // Transform array of translations to expected format
      const formattedTranslations: Record<string, { en: Record<string, string>, pt: Record<string, string> }> = translations.reduce((acc, translation) => {
        const { key, en, pt } = translation;
        const [section, translationKey] = key.split('.');
        
        if (!acc[section]) {
          acc[section] = { en: {}, pt: {} };
        }
        
        acc[section].en[translationKey] = en;
        acc[section].pt[translationKey] = pt;
        
        return acc;
      }, {} as Record<string, { en: Record<string, string>, pt: Record<string, string> }>);
      
      res.status(200).json(formattedTranslations);
    } catch (error) {
      console.error("Error fetching translations:", error);
      // Fallback to default translations
      res.status(200).json(defaultTranslations);
    }
  });
  
  app.post("/api/translations", async (req, res) => {
    try {
      const translationData = insertTranslationSchema.parse(req.body);
      const translation = await storage.createTranslation(translationData);
      res.status(201).json(translation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Error creating translation" });
      }
    }
  });
  
  app.put("/api/translations/:key", async (req, res) => {
    try {
      const key = req.params.key;
      const translationData = req.body;
      
      const translation = await storage.updateTranslation(key, translationData);
      res.status(200).json(translation);
    } catch (error) {
      res.status(500).json({ message: "Error updating translation" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
