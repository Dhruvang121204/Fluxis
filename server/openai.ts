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

// Enhanced financial advice responses for common questions when API is unavailable
// Each category now has multiple response options for more variety
const fallbackResponses = {
  budget: [
    "Creating a budget is essential for financial health. Start by tracking all income and expenses for a month, then categorize them and look for areas to optimize. The 50/30/20 rule is a good starting point: 50% for needs, 30% for wants, and 20% for savings and debt reduction.",
    "For effective budgeting, try the envelope method - allocate cash for different spending categories in separate envelopes at the start of each month. Once an envelope is empty, stop spending in that category. Digital alternatives like multiple sub-accounts can work similarly. Review your budget quarterly to adjust for changing circumstances.",
    "Consider zero-based budgeting where you assign every rupee a specific job. Using apps like Fluxis can automate this process. Track your spending for two months to establish realistic budget categories, then adjust as needed. Remember that a budget isn't about restriction but about intentional spending aligned with your priorities."
  ],
  save: [
    "To improve your savings, consider automating transfers to a separate savings account on payday. Try the 24-hour rule for non-essential purchases: wait 24 hours before buying to reduce impulse spending. Review and eliminate unused subscriptions and look for cheaper alternatives to current services.",
    "Boost your savings with the 'pay yourself first' strategy - automatically divert 10-20% of each paycheck to savings before spending on anything else. For discretionary spending, use the 1% rule: for purchases over ₹5,000, wait one day for every ₹500 spent before deciding. This reduces impulse buying and emotional purchases.",
    "Try savings challenges to build momentum - the 52-week challenge starts with saving ₹100 in week one, ₹200 in week two, and so on. By the end of the year, you'll have saved ₹137,800. Also, consider the 30-day rule: when tempted by a non-essential purchase, wait 30 days and save the money instead."
  ],
  invest: [
    "For beginners in India, consider starting with low-cost index funds tracking Nifty50 or SensexNEXT which provide diversification. If your employer offers the National Pension System (NPS) with matching contributions, prioritize contributing enough to get the full match. Generally, invest with money you won't need for at least 5-7 years to ride out market fluctuations.",
    "New investors should consider Systematic Investment Plans (SIPs) in diversified equity mutual funds, allowing consistent investing with as little as ₹500 monthly. Start with a mix of large-cap funds for stability and mid-cap funds for growth. Use tax-saving ELSS funds to fulfill Section 80C deductions while building your investment portfolio.",
    "A balanced approach for Indian investors includes Equity for long-term growth (index funds, blue-chip stocks), Debt for stability (government bonds, corporate fixed deposits), and alternatives like REITs or Gold ETFs for diversification. Automate investments through SIPs and increase your allocation by 5% with each salary increment."
  ],
  debt: [
    "Prioritize paying off high-interest debt first, like credit cards. Consider the snowball method (paying off smallest debts first) for psychological wins, or the avalanche method (highest interest first) to minimize interest payments. Always pay more than the minimum whenever possible.",
    "For tackling debt effectively, list all debts with their interest rates and minimum payments. Allocate extra money to either the highest-interest debt (avalanche method) or smallest balance (snowball method). Simultaneously, negotiate with creditors for lower interest rates and explore balance transfer options for credit card debt.",
    "Consider debt consolidation if you have multiple high-interest loans. Personal loans from banks often offer lower rates than credit cards. For home loans, review refinancing options when interest rates drop. Remember that not all debt is bad - strategically using low-interest loans for assets that appreciate (like education or property) can be financially sound."
  ],
  emergency: [
    "An emergency fund should ideally cover 3-6 months of essential expenses. Keep it in a high-yield savings account that's easily accessible but separate from your daily spending account. Start with a goal of ₹50,000, then build from there.",
    "Build your emergency fund in stages: first aim for ₹25,000 to handle minor emergencies, then work toward one month of expenses, and finally reach 3-6 months of essential costs. Split this between a savings account for immediate access and a liquid fund for slightly better returns while maintaining accessibility.",
    "For self-employed individuals or those with irregular income, aim for 6-9 months of expenses in your emergency fund. Consider a ladder approach: keep 1-2 months of expenses in a savings account and the remainder in increasingly longer-term deposits for better returns while maintaining reasonable liquidity."
  ],
  credit: [
    "To improve your credit score in India, always pay bills on time, keep credit card balances low (below 30% of your limit), don't close old accounts, limit new credit applications, and regularly check your CIBIL score for errors through free annual reports.",
    "Build a strong credit history by using a secured credit card if you're starting out. Pay utility bills through your credit card and set up auto-pay to ensure timely payments. Maintain a healthy credit mix with both secured loans (like home loans) and unsecured credit (like credit cards), but only take loans you actually need.",
    "Monitor your credit report regularly through free services from CIBIL, Experian, or Equifax. Dispute any errors immediately. Avoid multiple loan applications in a short period as each creates a hard inquiry. Instead of closing unused credit cards, use them occasionally for small purchases and pay off immediately to maintain account activity."
  ],
  tax: [
    "Optimize your tax situation by taking advantage of all deductions under Section 80C (up to ₹1.5 lakh) through ELSS funds, PPF, or NPS contributions. Use Section 80D for medical insurance premiums, and consider home loan benefits under Sections 24 and 80EE if applicable. For complex situations, consulting with a CA can often save you money.",
    "Consider the tax regime choice carefully - the new tax regime offers lower rates but fewer deductions, while the old regime allows for significant tax savings through strategic investments and expenses. Maintain supporting documents for all deductions and prepare your tax filings quarterly rather than rushing at year-end.",
    "Beyond the obvious deductions, explore lesser-known tax benefits like Section 80GG for house rent (if not receiving HRA), Section 80TTA for savings account interest up to ₹10,000, and Section 80G for charitable donations. For business owners, maintaining separate business and personal accounts simplifies tax compliance and documentation."
  ],
  housing: [
    "When budgeting for housing in India, follow the 30% rule - spend no more than 30% of your net monthly income on housing costs. Factor in maintenance, property tax, and home insurance beyond just the EMI or rent. For homebuyers, ensure your down payment is at least 20% to secure better interest rates.",
    "Before purchasing property, compare the price-to-rent ratio in your area. If annual rent is less than 5% of the property price, renting might be more economical. When taking a home loan, opt for a shorter tenure if possible - even paying 5% extra on monthly EMI can significantly reduce your total interest outgo over the loan period.",
    "Consider location trade-offs carefully - a longer commute to work might mean lower housing costs but higher transportation expenses and time costs. For first-time homebuyers, explore PMAY benefits and SBI Maxgain or similar loans that function like an overdraft, reducing interest payments while maintaining liquidity."
  ],
  retirement: [
    "For retirement planning in India, diversify across EPF/PPF, NPS, and mutual funds through SIPs. Aim to save at least 15% of income for retirement, increasing by 5% every five years. Take advantage of employer-matching contributions in EPF/NPS, and consider a mix of tax-saving and growth-oriented options.",
    "Create a retirement corpus using the 25X rule - you need approximately 25 times your annual expenses at retirement. With average inflation in India at 6%, your purchasing power halves every 12 years, so factor this into calculations. Shift investments from growth to income-generating assets gradually as you approach retirement.",
    "Beyond financial assets, consider real estate for rental income during retirement. Stay updated on senior citizen schemes with preferential interest rates. Review and rebalance your retirement portfolio annually, gradually shifting from equity to debt as you approach retirement age to protect against market volatility."
  ],
  default: [
    "Managing your finances effectively involves creating a budget, building an emergency fund, paying down high-interest debt, saving for future goals, and investing for the long term. Start small with achievable steps, and focus on consistent progress rather than perfection.",
    "Financial wellness requires balancing current enjoyment with future security. Follow the 72-hour rule for major purchases, automate your savings and investments, and review your financial plan quarterly. Remember that financial goals should align with your personal values - there's no one-size-fits-all approach.",
    "Develop a personal financial system with these pillars: track spending consciously, automate savings and bill payments, review subscriptions quarterly, increase your financial knowledge through books and courses, and celebrate small wins along your financial journey. Consistency matters more than perfection."
  ]
};

// Get advice for a specific financial question
export async function getFinancialAdvice(question: string): Promise<string> {
  try {
    // Check if we have a valid API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
      return getLocalFinancialAdvice(question);
    }

    try {
      // Create a more varied and context-specific system prompt
      let systemPrompt = `
You are FinanceGPT, a sophisticated financial advisor with expertise in Indian finance. 
Provide personalized, concise, and practical financial advice tailored to the user's specific question.
Use examples relevant to Indian financial context when appropriate.
Your responses should:
1. Be diverse and avoid repetition, especially if you've been asked similar questions before
2. Include specific actionable steps rather than just general principles
3. Incorporate current financial best practices for 2025
4. Consider the Indian financial environment, including relevant regulations and investment options
5. Be conversational but authoritative
6. ALWAYS provide a fresh, unique response - never repeat the same answers

Current date: April 2, 2025`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: question
          }
        ],
        max_tokens: 350,
        temperature: 0.9, // Increased temperature for more variability
        presence_penalty: 0.6, // Discourage repetition
        frequency_penalty: 0.6, // Further discourage repetition
      });

      return response.choices[0].message.content || getLocalFinancialAdvice(question);
    } catch (apiError) {
      console.error("OpenAI API error:", apiError);
      // If we get an API error, provide a fallback or local response
      return getLocalFinancialAdvice(question);
    }
  } catch (error) {
    console.error("Error generating financial advice:", error);
    return "I'm having trouble processing your question. Please try again with a clear financial question.";
  }
}

// Helper function to get a random response from an array
function getRandomResponse(responses: string[]): string {
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

// Provide fallback responses when API is unavailable, with randomized selection for variety
function getLocalFinancialAdvice(question: string): string {
  // Convert to lowercase for matching
  const lowerQuestion = question.toLowerCase();
  
  // Check for keywords in the question and return a random response from the appropriate category
  if (lowerQuestion.includes("budget") || lowerQuestion.includes("spending") || lowerQuestion.includes("track")) {
    return getRandomResponse(fallbackResponses.budget);
  } else if (lowerQuestion.includes("save") || lowerQuestion.includes("saving")) {
    return getRandomResponse(fallbackResponses.save);
  } else if (lowerQuestion.includes("invest") || lowerQuestion.includes("stock") || lowerQuestion.includes("market")) {
    return getRandomResponse(fallbackResponses.invest);
  } else if (lowerQuestion.includes("debt") || lowerQuestion.includes("loan") || lowerQuestion.includes("credit card")) {
    return getRandomResponse(fallbackResponses.debt);
  } else if (lowerQuestion.includes("emergency") || lowerQuestion.includes("fund")) {
    return getRandomResponse(fallbackResponses.emergency);
  } else if (lowerQuestion.includes("credit") || lowerQuestion.includes("score")) {
    return getRandomResponse(fallbackResponses.credit);
  } else if (lowerQuestion.includes("tax") || lowerQuestion.includes("taxes")) {
    return getRandomResponse(fallbackResponses.tax);
  } else if (lowerQuestion.includes("house") || lowerQuestion.includes("home") || lowerQuestion.includes("mortgage") || lowerQuestion.includes("rent")) {
    return getRandomResponse(fallbackResponses.housing);
  } else if (lowerQuestion.includes("retire") || lowerQuestion.includes("retirement") || lowerQuestion.includes("401k") || lowerQuestion.includes("ira") || lowerQuestion.includes("nps") || lowerQuestion.includes("epf")) {
    return getRandomResponse(fallbackResponses.retirement);
  } else {
    return getRandomResponse(fallbackResponses.default);
  }
}
