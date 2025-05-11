import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export type Language = "en" | "pt";
export const LANGUAGES = ["en", "pt"] as const;

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  points: integer("points").default(0),
  subscriptionPlan: text("subscription_plan").default("free"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Document table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // id_card, drivers_license, passport, bank_card
  name: text("name").notNull(),
  documentNumber: text("document_number").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"), // active, lost, found
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lostAt: timestamp("lost_at"),
  lostLocation: text("lost_location"),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true 
});
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Lost document table
export const lostDocuments = pgTable("lost_documents", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  userId: integer("user_id").notNull(),
  lostAt: timestamp("lost_at").notNull(),
  lostLocation: text("lost_location"),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLostDocumentSchema = createInsertSchema(lostDocuments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertLostDocument = z.infer<typeof insertLostDocumentSchema>;
export type LostDocument = typeof lostDocuments.$inferSelect & {
  document: Document;
  user: User;
};

// Found document table
export const foundDocuments = pgTable("found_documents", {
  id: serial("id").primaryKey(),
  foundBy: integer("found_by").notNull(),
  foundLocation: text("found_location").notNull(),
  documentType: text("document_type").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  foundAt: timestamp("found_at").defaultNow(),
  status: text("status").notNull().default("pending"), // pending, claimed, unclaimed
  possibleMatches: jsonb("possible_matches").$type<number[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFoundDocumentSchema = createInsertSchema(foundDocuments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertFoundDocument = z.infer<typeof insertFoundDocumentSchema>;
export type FoundDocument = typeof foundDocuments.$inferSelect;

// Chat table
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  senderId: integer("sender_id").notNull(),
  text: text("text").default(""),
  imageUrl: text("image_url"),
  timestamp: timestamp("timestamp").defaultNow(),
  read: boolean("read").default(false),
});

export const insertChatSchema = createInsertSchema(chats).omit({ 
  id: true 
});
export type InsertChat = z.infer<typeof insertChatSchema>;
export type Chat = typeof chats.$inferSelect;

// Conversation table
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  participants: jsonb("participants").$type<number[]>().notNull(),
  lastMessage: jsonb("last_message").$type<Chat>(),
  documentId: integer("document_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({ 
  id: true, 
  lastMessage: true,
  createdAt: true, 
  updatedAt: true 
});
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// User Settings table
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  language: text("language").notNull().default("en"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  darkMode: boolean("dark_mode").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

// Translations table 
export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  en: text("en").notNull(),
  pt: text("pt").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTranslationSchema = createInsertSchema(translations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Translation = typeof translations.$inferSelect;

// Define all relations after all tables have been defined
export const usersRelations = relations(users, ({ many, one }) => ({
  documents: many(documents),
  lostDocuments: many(lostDocuments),
  settings: one(userSettings),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  lostDocument: one(lostDocuments, {
    fields: [documents.id],
    references: [lostDocuments.documentId],
  }),
}));

export const lostDocumentsRelations = relations(lostDocuments, ({ one }) => ({
  document: one(documents, {
    fields: [lostDocuments.documentId],
    references: [documents.id],
  }),
  user: one(users, {
    fields: [lostDocuments.userId],
    references: [users.id],
  }),
}));

export const foundDocumentsRelations = relations(foundDocuments, ({ one }) => ({
  finder: one(users, {
    fields: [foundDocuments.foundBy],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ many, one }) => ({
  messages: many(chats),
  document: one(documents, {
    fields: [conversations.documentId],
    references: [documents.id],
  }),
}));

export const chatsRelations = relations(chats, ({ one }) => ({
  conversation: one(conversations, {
    fields: [chats.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [chats.senderId],
    references: [users.id],
  }),
}));
