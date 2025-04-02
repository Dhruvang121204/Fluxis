import { pgTable, text, serial, integer, boolean, timestamp, json, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

// Transaction model
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'income' or 'expense'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  category: text("category").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create the base schema from the table definition
const baseTransactionSchema = createInsertSchema(transactions);

// Create a custom schema that allows amount to be either number or string
export const insertTransactionSchema = baseTransactionSchema
  .extend({
    // Override the amount field to accept both number and string
    amount: z.union([z.number(), z.string()]),
  })
  .pick({
    userId: true,
    type: true,
    amount: true,
    description: true,
    category: true,
    date: true,
  });

// Budget model
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  period: text("period").notNull(), // 'monthly', 'weekly', etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Create the base schema from the table definition
const baseBudgetSchema = createInsertSchema(budgets);

// Create a custom schema that allows amount to be either number or string
export const insertBudgetSchema = baseBudgetSchema
  .extend({
    // Override the amount field to accept both number and string
    amount: z.union([z.number(), z.string()]),
  })
  .pick({
    userId: true,
    category: true,
    amount: true,
    period: true,
  });

// Financial goal model
export const financialGoals = pgTable("financial_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).notNull(),
  targetDate: timestamp("target_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create the base schema from the table definition
const baseFinancialGoalSchema = createInsertSchema(financialGoals);

// Create a custom schema that allows amount fields to be either number or string
export const insertFinancialGoalSchema = baseFinancialGoalSchema
  .extend({
    // Override the amount fields to accept both number and string
    targetAmount: z.union([z.number(), z.string()]),
    currentAmount: z.union([z.number(), z.string()]),
  })
  .pick({
    userId: true,
    name: true,
    targetAmount: true,
    currentAmount: true,
    targetDate: true,
  });

// Category model
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'income' or 'expense'
  icon: text("icon"),
  color: text("color"),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  type: true,
  icon: true,
  color: true,
});

// User settings
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  theme: text("theme").default("light"),
  currency: text("currency").default("USD"),
  language: text("language").default("en"),
  notifications: boolean("notifications").default(true),
  settings: json("settings").default({}),
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).pick({
  userId: true,
  theme: true,
  currency: true,
  language: true,
  notifications: true,
  settings: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;

export type InsertFinancialGoal = z.infer<typeof insertFinancialGoalSchema>;
export type FinancialGoal = typeof financialGoals.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
