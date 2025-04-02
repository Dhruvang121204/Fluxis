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

// Basic financial advice responses for common questions when API is unavailable
const fallbackResponses: Record<string, string> = {
  budget: "Creating a budget is essential for financial health. Start by tracking all income and expenses for a month, then categorize them and look for areas to optimize. The 50/30/20 rule is a good starting point: 50% for needs, 30% for wants, and 20% for savings and debt reduction.",
  save: "To improve your savings, consider automating transfers to a separate savings account on payday. Try the 24-hour rule for non-essential purchases: wait 24 hours before buying to reduce impulse spending. Review and eliminate unused subscriptions and look for cheaper alternatives to current services.",
  invest: "For beginners, consider starting with low-cost index funds or ETFs which provide diversification. If your employer offers a retirement plan with matching contributions, prioritize contributing enough to get the full match. Generally, invest with money you won't need for at least 5 years to ride out market fluctuations.",
  debt: "Prioritize paying off high-interest debt first, like credit cards. Consider the snowball method (paying off smallest debts first) for psychological wins, or the avalanche method (highest interest first) to minimize interest payments. Always pay more than the minimum whenever possible.",
  emergency: "An emergency fund should ideally cover 3-6 months of essential expenses. Keep it in a high-yield savings account that's easily accessible but separate from your daily spending account. Start with a goal of $1,000, then build from there.",
  credit: "To improve your credit score, always pay bills on time, keep credit card balances low (below 30% of your limit), don't close old accounts, limit new credit applications, and regularly check your credit report for errors.",
  tax: "Optimize your tax situation by contributing to tax-advantaged accounts like 401(k)s or IRAs, keeping track of potential deductions throughout the year, and considering tax-efficient investments for non-retirement accounts. If your situation is complex, consulting with a tax professional can often save you money.",
  housing: "When budgeting for housing, the 28/36 rule suggests spending no more than 28% of gross income on housing costs and no more than 36% on total debt. Remember to factor in utilities, maintenance, insurance, and property taxes beyond just the mortgage or rent payment.",
  retirement: "For retirement planning, aim to save at least 15% of pre-tax income annually. Take full advantage of employer matches in retirement plans, and consider a mix of pre-tax and Roth contributions for tax diversity in retirement. Increase your savings rate whenever you receive a raise.",
  default: "Managing your finances effectively involves creating a budget, building an emergency fund, paying down high-interest debt, saving for future goals, and investing for the long term. Start small with achievable steps, and focus on consistent progress rather than perfection."
};

// Get advice for a specific financial question
export async function getFinancialAdvice(question: string): Promise<string> {
  try {
    // Check if we have a valid API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
      return getLocalFinancialAdvice(question);
    }

    try {
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

      return response.choices[0].message.content || getLocalFinancialAdvice(question);
    } catch (apiError) {
      console.error("OpenAI API error:", apiError);
      return getLocalFinancialAdvice(question);
    }
  } catch (error) {
    console.error("Error generating financial advice:", error);
    return "I'm having trouble processing your question. Please try again with a clear financial question.";
  }
}

// Provide fallback responses when API is not available
function getLocalFinancialAdvice(question: string): string {
  // Convert to lowercase for matching
  const lowerQuestion = question.toLowerCase();
  
  // Check for keywords in the question
  if (lowerQuestion.includes("budget") || lowerQuestion.includes("spending") || lowerQuestion.includes("track")) {
    return fallbackResponses.budget;
  } else if (lowerQuestion.includes("save") || lowerQuestion.includes("saving")) {
    return fallbackResponses.save;
  } else if (lowerQuestion.includes("invest") || lowerQuestion.includes("stock") || lowerQuestion.includes("market")) {
    return fallbackResponses.invest;
  } else if (lowerQuestion.includes("debt") || lowerQuestion.includes("loan") || lowerQuestion.includes("credit card")) {
    return fallbackResponses.debt;
  } else if (lowerQuestion.includes("emergency") || lowerQuestion.includes("fund")) {
    return fallbackResponses.emergency;
  } else if (lowerQuestion.includes("credit") || lowerQuestion.includes("score")) {
    return fallbackResponses.credit;
  } else if (lowerQuestion.includes("tax") || lowerQuestion.includes("taxes")) {
    return fallbackResponses.tax;
  } else if (lowerQuestion.includes("house") || lowerQuestion.includes("home") || lowerQuestion.includes("mortgage") || lowerQuestion.includes("rent")) {
    return fallbackResponses.housing;
  } else if (lowerQuestion.includes("retire") || lowerQuestion.includes("retirement") || lowerQuestion.includes("401k") || lowerQuestion.includes("ira")) {
    return fallbackResponses.retirement;
  } else {
    return fallbackResponses.default;
  }
}
