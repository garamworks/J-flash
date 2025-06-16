import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  japanese: text("japanese").notNull(),
  furigana: text("furigana").notNull(),
  korean: text("korean").notNull(),
  sentence: text("sentence").notNull(),
  sentenceKorean: text("sentence_korean").notNull(),
  imageUrl: text("image_url").notNull(),
  audioUrl: text("audio_url"),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  flashcardId: integer("flashcard_id").notNull(),
  known: boolean("known").notNull(),
});

export const insertFlashcardSchema = createInsertSchema(flashcards).omit({
  id: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type Flashcard = typeof flashcards.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
