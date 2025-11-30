import { pgTable, text, serial, integer, boolean, bigint } from "drizzle-orm/pg-core";
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
  wordAudioUrl: text("word_audio_url"),
  pronunciationAudioUrl: text("pronunciation_audio_url"),
});

export const grammarFlashcards = pgTable("grammar_flashcards", {
  id: serial("id").primaryKey(),
  problemSentence: text("problem_sentence").notNull(), // 문법 부분이 가려진 문장
  exampleSentence: text("example_sentence").notNull(), // 문법 부분이 채워진 문장
  exampleKorean: text("example_korean").notNull(), // 예문 해석
  grammar: text("grammar").notNull(), // 문법(일본어)
  meaning: text("meaning").notNull(), // 뜻(한국어)
  audioUrl: text("audio_url"), // 스피커 버튼용 오디오
  notionPageId: text("notion_page_id"), // Notion 페이지 ID for accurate mapping
});

export const expressionFlashcards = pgTable("expression_flashcards", {
  id: serial("id").primaryKey(),
  mainExpression: text("main_expression").notNull(), // 메인 일본어 표현
  mainMeaning: text("main_meaning").notNull(), // 메인 표현의 뜻
  application1: text("application1").notNull(), // 응용표현 1 (일본어)
  application1Korean: text("application1_korean").notNull(), // 응용표현 1 (한국어)
  application2: text("application2").notNull(), // 응용표현 2 (일본어)
  application2Korean: text("application2_korean").notNull(), // 응용표현 2 (한국어)
  application3: text("application3").notNull(), // 응용표현 3 (일본어)
  application3Korean: text("application3_korean").notNull(), // 응용표현 3 (한국어)
  application4: text("application4").notNull(), // 응용표현 4 (일본어)
  application4Korean: text("application4_korean").notNull(), // 응용표현 4 (한국어)
  application5: text("application5").notNull(), // 응용표현 5 (일본어)
  application5Korean: text("application5_korean").notNull(), // 응용표현 5 (한국어)
  notionPageId: text("notion_page_id"), // Notion 페이지 ID for accurate mapping
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  flashcardId: bigint("flashcard_id", { mode: "number" }).notNull(),
  known: boolean("known").notNull(),
});

export const grammarProgress = pgTable("grammar_progress", {
  id: serial("id").primaryKey(),
  grammarFlashcardId: bigint("grammar_flashcard_id", { mode: "number" }).notNull(),
  known: boolean("known").notNull(),
});

export const expressionProgress = pgTable("expression_progress", {
  id: serial("id").primaryKey(),
  expressionFlashcardId: bigint("expression_flashcard_id", { mode: "number" }).notNull(),
  known: boolean("known").notNull(),
});

export const insertFlashcardSchema = createInsertSchema(flashcards).omit({
  id: true,
}).extend({
  wordAudioUrl: z.string().nullable().optional(),
  pronunciationAudioUrl: z.string().nullable().optional(),
});

export const insertGrammarFlashcardSchema = createInsertSchema(grammarFlashcards).omit({
  id: true,
}).extend({
  audioUrl: z.string().nullable().optional(),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
}).extend({
  notionPageId: z.string().optional(),
  level: z.string().optional(),
});

export const insertGrammarProgressSchema = createInsertSchema(grammarProgress).omit({
  id: true,
}).extend({
  notionPageId: z.string().optional(), // Add notionPageId for direct updates
});

export const insertExpressionFlashcardSchema = createInsertSchema(expressionFlashcards).omit({
  id: true,
});

export const insertExpressionProgressSchema = createInsertSchema(expressionProgress).omit({
  id: true,
}).extend({
  notionPageId: z.string().optional(), // Add notionPageId for direct updates
});

export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type Flashcard = typeof flashcards.$inferSelect;
export type InsertGrammarFlashcard = z.infer<typeof insertGrammarFlashcardSchema>;
export type GrammarFlashcard = typeof grammarFlashcards.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertGrammarProgress = z.infer<typeof insertGrammarProgressSchema>;
export type GrammarProgress = typeof grammarProgress.$inferSelect;
export type InsertExpressionFlashcard = z.infer<typeof insertExpressionFlashcardSchema>;
export type ExpressionFlashcard = typeof expressionFlashcards.$inferSelect;
export type InsertExpressionProgress = z.infer<typeof insertExpressionProgressSchema>;
export type ExpressionProgress = typeof expressionProgress.$inferSelect;

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
