import OpenAI from "openai";
import { Transaction, Budget } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

// Generate financial insights based on user's transactions and budgets
export async function getFinanceInsight(
  transactions: Transaction[],
  budgets: Budget[]
): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return "To get personalized financial insights, please set up your OpenAI API key.";
    }

    // Prepare data for the AI
    const transactionData = transactions.map(t => ({
      type: t.type,
      amount: Number(t.amount),
      category: t.category,
      date: new Date(t.date).toISOString().split('T')[0]
    }));

    const budgetData = budgets.map(b => ({
      category: b.category,
      amount: Number(b.amount),
      period: b.period
    }));

    // Calculate some basic stats to help the AI
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const categorySpending: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + Number(t.amount);
      });

    // Create a prompt for the AI
    const prompt = `
      As a financial advisor, analyze this user's financial data and provide one actionable insight:
      
      Total income: $${totalIncome.toFixed(2)}
      Total expenses: $${totalExpenses.toFixed(2)}
      Balance: $${(totalIncome - totalExpenses).toFixed(2)}
      
      Top spending categories:
      ${Object.entries(categorySpending)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category, amount]) => `- ${category}: $${amount.toFixed(2)}`)
        .join('\n')}
      
      Return your analysis as a single concise paragraph that highlights one key insight about their spending habits, 
      budget allocation, or savings strategy, with a specific actionable recommendation. Don't introduce yourself 
      or use phrases like "based on the data." Start directly with the insight.
    `;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0].message.content || 
      "Based on your recent transactions, consider setting up a budget for your main spending categories.";
  } catch (error) {
    console.error("Error generating financial insight:", error);
    return "Unable to generate financial insights at this time. Please try again later.";
  }
}

// Get advice for a specific financial question
export async function getFinancialAdvice(question: string): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return "To get personalized financial advice, please set up your OpenAI API key.";
    }

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are FinanceGPT, a helpful and knowledgeable financial advisor. Provide concise, practical financial advice."
        },
        {
          role: "user",
          content: question
        }
      ],
      max_tokens: 250,
      temperature: 0.7,
    });

    return response.choices[0].message.content || 
      "I'm sorry, I couldn't generate specific advice for your question. Please try rephrasing it.";
  } catch (error) {
    console.error("Error generating financial advice:", error);
    return "Unable to provide financial advice at this time. Please try again later.";
  }
}
