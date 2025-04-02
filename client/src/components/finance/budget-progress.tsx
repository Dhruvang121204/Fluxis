import { useQuery } from "@tanstack/react-query";
import { Transaction, Budget } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { 
  Utensils, 
  ShoppingBag, 
  Gamepad, 
  Home, 
  Car, 
  Heart,
  Lightbulb,
  Plane,
  BookOpen
} from "lucide-react";

interface BudgetProgressProps {
  showManage?: boolean;
  standalone?: boolean;
}

export default function BudgetProgress({ showManage = true, standalone = false }: BudgetProgressProps) {
  const [_, setLocation] = useLocation();
  
  const { data: budgets, isLoading: loadingBudgets } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const { data: transactions, isLoading: loadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const isLoading = loadingBudgets || loadingTransactions;

  // Get current month's expenses for each budget category
  const getCategorySpending = (category: string) => {
    if (!transactions) return 0;
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return transactions
      .filter(t => 
        t.type === "expense" && 
        t.category === category && 
        new Date(t.date) >= firstDayOfMonth
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  // Get icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food & dining':
        return <Utensils className="w-4 h-4 text-success-500" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4 text-warning-500" />;
      case 'entertainment':
        return <Gamepad className="w-4 h-4 text-danger-500" />;
      case 'housing':
        return <Home className="w-4 h-4 text-primary-500" />;
      case 'transportation':
        return <Car className="w-4 h-4 text-amber-500" />;
      case 'healthcare':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'utilities':
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'travel':
        return <Plane className="w-4 h-4 text-indigo-500" />;
      case 'education':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      default:
        return <Utensils className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get progress color based on percentage
  const getProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    
    if (percentage > 100) return "bg-danger-500";
    if (percentage > 75) return "bg-warning-500";
    return "bg-success-500";
  };

  // Handle manage button click
  const handleManage = () => {
    setLocation("/budget");
  };

  // If standalone is false, render as a card section
  const content = (
    <>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-800">Budget Progress</h2>
        {showManage && (
          <Button variant="link" className="text-primary-500 p-0 h-auto" onClick={handleManage}>
            Manage
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          // Loading state
          [...Array(3)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between mb-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))
        ) : budgets && budgets.length > 0 ? (
          budgets.slice(0, 3).map((budget) => {
            const spent = getCategorySpending(budget.category);
            const limit = Number(budget.amount);
            const percentage = Math.min(100, Math.round((spent / limit) * 100));
            
            return (
              <div key={budget.id}>
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    {getCategoryIcon(budget.category)}
                    <p className="text-sm font-medium ml-2">{budget.category}</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-mono font-medium">₹{spent.toFixed(0)}</span>
                    <span className="text-gray-500">/</span>
                    <span className="text-gray-500 font-mono">₹{limit.toFixed(0)}</span>
                  </div>
                </div>
                <Progress 
                  value={percentage} 
                  className={`h-2 bg-gray-200 ${getProgressColor(spent, limit)}`}
                />
              </div>
            );
          })
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No budgets set</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setLocation("/budget")}
            >
              Set Your First Budget
            </Button>
          </div>
        )}
      </div>
    </>
  );

  // If standalone is true, just return the content without the card
  if (standalone) {
    return content;
  }

  // Otherwise, wrap in a card
  return (
    <Card>
      <CardContent className="p-4">
        {content}
      </CardContent>
    </Card>
  );
}
