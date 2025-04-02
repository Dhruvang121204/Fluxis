import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { getFinanceInsight, getFinancialAdvice } from "./openai";
import { 
  insertTransactionSchema, 
  insertBudgetSchema, 
  insertFinancialGoalSchema,
  insertUserSettingsSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Ensure user is authenticated for protected routes
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Transactions API
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const transactions = await storage.getTransactionsByUserId(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const result = insertTransactionSchema.safeParse({ ...req.body, userId });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid transaction data" });
      }
      
      const transaction = await storage.createTransaction(result.data);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.get("/api/transactions/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const transactionId = parseInt(req.params.id);
      
      if (isNaN(transactionId)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }
      
      const transaction = await storage.getTransactionById(transactionId);
      
      if (!transaction || transaction.userId !== userId) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  app.delete("/api/transactions/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const transactionId = parseInt(req.params.id);
      
      if (isNaN(transactionId)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }
      
      const transaction = await storage.getTransactionById(transactionId);
      
      if (!transaction || transaction.userId !== userId) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      await storage.deleteTransaction(transactionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Budgets API
  app.get("/api/budgets", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const budgets = await storage.getBudgetsByUserId(userId);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const result = insertBudgetSchema.safeParse({ ...req.body, userId });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid budget data" });
      }
      
      const budget = await storage.createBudget(result.data);
      res.status(201).json(budget);
    } catch (error) {
      res.status(500).json({ message: "Failed to create budget" });
    }
  });

  // Financial Goals API
  app.get("/api/goals", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const goals = await storage.getFinancialGoalsByUserId(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch financial goals" });
    }
  });

  app.post("/api/goals", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const result = insertFinancialGoalSchema.safeParse({ ...req.body, userId });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid financial goal data" });
      }
      
      const goal = await storage.createFinancialGoal(result.data);
      res.status(201).json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to create financial goal" });
    }
  });

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // User Settings API
  app.get("/api/settings", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const settings = await storage.getUserSettingsByUserId(userId);
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });

  app.post("/api/settings", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const result = insertUserSettingsSchema.safeParse({ ...req.body, userId });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid settings data" });
      }
      
      const existingSettings = await storage.getUserSettingsByUserId(userId);
      let settings;
      
      if (existingSettings) {
        settings = await storage.updateUserSettings(userId, result.data);
      } else {
        settings = await storage.createUserSettings(result.data);
      }
      
      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user settings" });
    }
  });

  // Finance AI Insights API
  app.get("/api/insights", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const transactions = await storage.getTransactionsByUserId(userId);
      const budgets = await storage.getBudgetsByUserId(userId);
      
      // Get AI insights
      const insight = await getFinanceInsight(transactions, budgets);
      res.json({ insight });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate financial insights" });
    }
  });
  
  // Financial Advice API
  app.get("/api/advice", requireAuth, async (req, res) => {
    try {
      const { question } = req.query;
      
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ message: "Question is required" });
      }
      
      const advice = await getFinancialAdvice(question);
      res.json({ advice });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate financial advice" });
    }
  });

  // Finance News API (simplified mock version)
  app.get("/api/news", requireAuth, async (req, res) => {
    try {
      // In a real app, we would fetch from a news API
      const news = [
        {
          id: 1,
          title: "Fed Signals Potential Rate Cuts as Inflation Eases",
          summary: "The Federal Reserve indicated it might lower interest rates soon as inflation shows signs of cooling down.",
          url: "https://example.com/finance-news/1",
          publishedAt: new Date().toISOString(),
          readTime: "3 min read"
        },
        {
          id: 2,
          title: "5 Tips to Boost Your Retirement Savings Strategy",
          summary: "Financial experts share strategies to maximize your retirement savings, even when starting late.",
          url: "https://example.com/finance-news/2",
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          readTime: "5 min read"
        },
        {
          id: 3,
          title: "Understanding Market Volatility: A Guide for New Investors",
          summary: "Learn how to navigate market fluctuations and maintain a long-term investment strategy.",
          url: "https://example.com/finance-news/3",
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          readTime: "4 min read"
        }
      ];
      
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch finance news" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
