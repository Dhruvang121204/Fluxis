import { useQuery } from "@tanstack/react-query";
import { Transaction, UserSettings } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Briefcase, Film, Droplet, Home, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";

export default function RecentTransactions() {
  const [_, setLocation] = useLocation();
  
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });
  
  const { data: userSettings, isLoading: settingsLoading } = useQuery<UserSettings>({
    queryKey: ["/api/user/settings"],
  });
  
  const isLoading = transactionsLoading || settingsLoading;
  
  // Determine the currency symbol based on user settings
  const getCurrencySymbol = () => {
    if (!userSettings?.currency) return "₹"; // Default to INR
    
    switch(userSettings.currency) {
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "INR": return "₹";
      case "JPY": return "¥";
      case "CAD": return "C$";
      case "AUD": return "A$";
      default: return "₹";
    }
  };

  const getRecentTransactions = () => {
    if (!transactions) return [];
    
    // Sort by date (newest first) and take the first 4
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);
  };

  const recentTransactions = getRecentTransactions();

  // Get appropriate icon based on category
  const getTransactionIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'salary':
      case 'freelance':
      case 'investments':
        return <Briefcase className="text-primary-500" />;
      case 'groceries':
      case 'food & dining':
        return <ShoppingCart className="text-primary-500" />;
      case 'subscriptions':
      case 'netflix':
        return <Film className="text-warning-500" />;
      case 'utilities':
        return <Droplet className="text-primary-500" />;
      case 'housing':
      case 'rent':
      case 'mortgage':
        return <Home className="text-primary-500" />;
      default:
        return <CreditCard className="text-primary-500" />;
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${format(date, "h:mm a")}`;
    }
    
    // If yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${format(date, "h:mm a")}`;
    }
    
    // Otherwise show full date
    return format(date, "MMM d, h:mm a");
  };

  const handleSeeAll = () => {
    setLocation("/transactions");
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
          <Button variant="link" className="text-primary-500 p-0 h-auto" onClick={handleSeeAll}>
            See All
          </Button>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            // Loading state
            [...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="ml-3">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No transactions yet</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => setLocation("/transactions")}
              >
                Add Your First Transaction
              </Button>
            </div>
          ) : (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full ${
                    transaction.type === 'income' 
                      ? 'bg-success-100' 
                      : transaction.category.toLowerCase().includes('subscription') 
                        ? 'bg-warning-100' 
                        : 'bg-primary-100'
                  } flex items-center justify-center`}>
                    {getTransactionIcon(transaction.category)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">
                      {transaction.description || transaction.category}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                  </div>
                </div>
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-success-500' : 'text-danger-500'
                } font-mono`}>
                  {transaction.type === 'income' ? '+' : '-'}{getCurrencySymbol()}{Number(transaction.amount).toFixed(0)}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
