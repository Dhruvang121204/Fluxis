import { 
  User, InsertUser, 
  Transaction, InsertTransaction,
  Budget, InsertBudget,
  FinancialGoal, InsertFinancialGoal,
  Category, InsertCategory,
  UserSettings, InsertUserSettings
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";
import { Decimal } from "decimal.js";

const MemoryStore = createMemoryStore(session);

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Transaction methods
  getTransactionById(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;

  // Budget methods
  getBudgetsByUserId(userId: number): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  
  // Financial Goal methods
  getFinancialGoalsByUserId(userId: number): Promise<FinancialGoal[]>;
  createFinancialGoal(goal: InsertFinancialGoal): Promise<FinancialGoal>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // User Settings methods
  getUserSettingsByUserId(userId: number): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: number, settings: InsertUserSettings): Promise<UserSettings>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private budgets: Map<number, Budget>;
  private financialGoals: Map<number, FinancialGoal>;
  private categories: Map<number, Category>;
  private userSettings: Map<number, UserSettings>;
  
  sessionStore: session.SessionStore;
  currentId: {
    users: number;
    transactions: number;
    budgets: number;
    financialGoals: number;
    categories: number;
    userSettings: number;
  };

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.budgets = new Map();
    this.financialGoals = new Map();
    this.categories = new Map();
    this.userSettings = new Map();
    
    this.currentId = {
      users: 1,
      transactions: 1,
      budgets: 1,
      financialGoals: 1,
      categories: 1,
      userSettings: 1
    };
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize default categories
    this.initializeCategories();
  }

  private async initializeCategories() {
    const defaultCategories: InsertCategory[] = [
      { name: "Salary", type: "income", icon: "ri-bank-line", color: "#10B981" },
      { name: "Freelance", type: "income", icon: "ri-briefcase-line", color: "#3B82F6" },
      { name: "Investments", type: "income", icon: "ri-stock-line", color: "#8B5CF6" },
      { name: "Other Income", type: "income", icon: "ri-money-dollar-circle-line", color: "#6366F1" },
      { name: "Housing", type: "expense", icon: "ri-home-line", color: "#2563EB" },
      { name: "Food & Dining", type: "expense", icon: "ri-restaurant-line", color: "#10B981" },
      { name: "Transportation", type: "expense", icon: "ri-car-line", color: "#F59E0B" },
      { name: "Healthcare", type: "expense", icon: "ri-heart-pulse-line", color: "#EF4444" },
      { name: "Shopping", type: "expense", icon: "ri-shopping-bag-line", color: "#EC4899" },
      { name: "Entertainment", type: "expense", icon: "ri-gamepad-line", color: "#8B5CF6" },
      { name: "Utilities", type: "expense", icon: "ri-lightbulb-line", color: "#F59E0B" },
      { name: "Education", type: "expense", icon: "ri-book-open-line", color: "#3B82F6" },
      { name: "Personal Care", type: "expense", icon: "ri-user-heart-line", color: "#EC4899" },
      { name: "Travel", type: "expense", icon: "ri-plane-line", color: "#6366F1" },
      { name: "Subscriptions", type: "expense", icon: "ri-netflix-fill", color: "#EF4444" },
      { name: "Other", type: "expense", icon: "ri-more-2-fill", color: "#6B7280" }
    ];
    
    for (const category of defaultCategories) {
      await this.createCategory(category);
    }
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
    const id = this.currentId.users++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  // Transaction methods
  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentId.transactions++;
    const createdAt = new Date();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      createdAt,
      amount: typeof insertTransaction.amount === 'string' 
        ? new Decimal(insertTransaction.amount) 
        : insertTransaction.amount
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async deleteTransaction(id: number): Promise<void> {
    this.transactions.delete(id);
  }

  // Budget methods
  async getBudgetsByUserId(userId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(
      (budget) => budget.userId === userId
    );
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = this.currentId.budgets++;
    const createdAt = new Date();
    const budget: Budget = { 
      ...insertBudget, 
      id, 
      createdAt,
      amount: typeof insertBudget.amount === 'string' 
        ? new Decimal(insertBudget.amount) 
        : insertBudget.amount
    };
    this.budgets.set(id, budget);
    return budget;
  }

  // Financial Goal methods
  async getFinancialGoalsByUserId(userId: number): Promise<FinancialGoal[]> {
    return Array.from(this.financialGoals.values()).filter(
      (goal) => goal.userId === userId
    );
  }

  async createFinancialGoal(insertGoal: InsertFinancialGoal): Promise<FinancialGoal> {
    const id = this.currentId.financialGoals++;
    const createdAt = new Date();
    const goal: FinancialGoal = { 
      ...insertGoal, 
      id, 
      createdAt,
      targetAmount: typeof insertGoal.targetAmount === 'string' 
        ? new Decimal(insertGoal.targetAmount) 
        : insertGoal.targetAmount,
      currentAmount: typeof insertGoal.currentAmount === 'string' 
        ? new Decimal(insertGoal.currentAmount) 
        : insertGoal.currentAmount
    };
    this.financialGoals.set(id, goal);
    return goal;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentId.categories++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // User Settings methods
  async getUserSettingsByUserId(userId: number): Promise<UserSettings | undefined> {
    return Array.from(this.userSettings.values()).find(
      (settings) => settings.userId === userId
    );
  }

  async createUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const id = this.currentId.userSettings++;
    const settings: UserSettings = { ...insertSettings, id };
    this.userSettings.set(id, settings);
    return settings;
  }

  async updateUserSettings(userId: number, insertSettings: InsertUserSettings): Promise<UserSettings> {
    const existingSettings = await this.getUserSettingsByUserId(userId);
    if (!existingSettings) {
      return this.createUserSettings(insertSettings);
    }
    
    const updatedSettings: UserSettings = {
      ...existingSettings,
      ...insertSettings,
    };
    
    this.userSettings.set(existingSettings.id, updatedSettings);
    return updatedSettings;
  }
}

export const storage = new MemStorage();
