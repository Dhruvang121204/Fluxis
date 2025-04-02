import { useQuery } from "@tanstack/react-query";
import { Transaction, UserSettings } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { subMonths } from "date-fns";
import { getCurrencySymbol } from "@/lib/currency";

export default function BalanceOverview() {
  const [timeframe, setTimeframe] = useState("month");
  
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });
  
  const { data: userSettings, isLoading: settingsLoading } = useQuery<UserSettings>({
    queryKey: ["/api/user/settings"],
  });
  
  const isLoading = transactionsLoading || settingsLoading;
  
  // Get the currency symbol from the settings
  const currencySymbol = getCurrencySymbol(userSettings?.currency || 'INR');

  const getFilteredTransactions = () => {
    if (!transactions) return [];
    
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "quarter":
        startDate = subMonths(now, 3);
        break;
      case "year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }
    
    return transactions.filter(t => new Date(t.date) >= startDate);
  };

  const filteredTransactions = getFilteredTransactions();
  
  // Calculate totals
  const income = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const expenses = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const balance = income - expenses;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Account Balance</h2>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="text-sm border-none bg-transparent text-gray-500 focus:outline-none w-[130px]">
              <SelectValue placeholder="This Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-1">Total Balance</p>
          {isLoading ? (
            <Skeleton className="h-9 w-40 mx-auto" />
          ) : (
            <h3 className="text-3xl font-semibold font-mono">{currencySymbol}{balance.toFixed(0)}</h3>
          )}
        </div>
        
        <div className="flex justify-between mt-4">
          <div className="text-center flex-1">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-success-500 flex items-center justify-center mb-1">
                <i className="ri-arrow-up-line text-white"></i>
              </div>
              <p className="text-xs text-gray-500">Income</p>
              {isLoading ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                <p className="text-base font-semibold font-mono">{currencySymbol}{income.toFixed(0)}</p>
              )}
            </div>
          </div>
          <div className="h-12 border-l border-gray-200"></div>
          <div className="text-center flex-1">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-danger-500 flex items-center justify-center mb-1">
                <i className="ri-arrow-down-line text-white"></i>
              </div>
              <p className="text-xs text-gray-500">Expenses</p>
              {isLoading ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                <p className="text-base font-semibold font-mono">{currencySymbol}{expenses.toFixed(0)}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
