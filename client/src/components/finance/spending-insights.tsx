import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useState, useEffect } from "react";
import { subMonths } from "date-fns";
import { Home, Utensils, Car, Heart, ShoppingBag, Gamepad, Lightbulb, BookOpen, User, Plane, Monitor, MoreHorizontal } from "lucide-react";

interface CategoryTotals {
  name: string;
  value: number;
  transactions: number;
  percentage: number;
  icon: React.ReactNode;
  color: string;
}

export default function SpendingInsights() {
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotals[]>([]);
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  useEffect(() => {
    if (!transactions) return;
    
    // Filter transactions to only include expenses from the last month
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    
    const expenses = transactions.filter(
      t => t.type === "expense" && new Date(t.date) >= lastMonth
    );
    
    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    
    // Group by category and calculate totals
    const categoryMap: Record<string, { amount: number; count: number }> = {};
    
    expenses.forEach(t => {
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = { amount: 0, count: 0 };
      }
      categoryMap[t.category].amount += Number(t.amount);
      categoryMap[t.category].count += 1;
    });
    
    // Convert to array and add percentage
    const categoryData = Object.entries(categoryMap).map(([name, { amount, count }]) => {
      const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
      
      // Get icon and color based on category
      let icon: React.ReactNode;
      let color: string;
      
      switch (name) {
        case "Housing":
          icon = <Home className="w-5 h-5" />;
          color = "#2563EB";
          break;
        case "Food & Dining":
          icon = <Utensils className="w-5 h-5" />;
          color = "#10B981";
          break;
        case "Transportation":
          icon = <Car className="w-5 h-5" />;
          color = "#F59E0B";
          break;
        case "Healthcare":
          icon = <Heart className="w-5 h-5" />;
          color = "#EF4444";
          break;
        case "Shopping":
          icon = <ShoppingBag className="w-5 h-5" />;
          color = "#EC4899";
          break;
        case "Entertainment":
          icon = <Gamepad className="w-5 h-5" />;
          color = "#8B5CF6";
          break;
        case "Utilities":
          icon = <Lightbulb className="w-5 h-5" />;
          color = "#F59E0B";
          break;
        case "Education":
          icon = <BookOpen className="w-5 h-5" />;
          color = "#3B82F6";
          break;
        case "Personal Care":
          icon = <User className="w-5 h-5" />;
          color = "#EC4899";
          break;
        case "Travel":
          icon = <Plane className="w-5 h-5" />;
          color = "#6366F1";
          break;
        case "Subscriptions":
          icon = <Monitor className="w-5 h-5" />;
          color = "#EF4444";
          break;
        default:
          icon = <MoreHorizontal className="w-5 h-5" />;
          color = "#6B7280";
      }
      
      return {
        name,
        value: amount,
        transactions: count,
        percentage,
        icon,
        color
      };
    });
    
    // Sort by amount (highest first)
    categoryData.sort((a, b) => b.value - a.value);
    
    setCategoryTotals(categoryData);
  }, [transactions]);

  // For the pie chart
  const chartData = categoryTotals.map(({ name, value }) => ({ name, value }));

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Spending Insights</h2>
          <Button variant="link" className="text-primary-500 p-0 h-auto">See All</Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="ml-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : categoryTotals.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No spending data available</p>
            <Button variant="outline" className="mt-4">Add Your First Expense</Button>
          </div>
        ) : (
          <>
            <div className="h-40 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={categoryTotals[index].color} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3">
              {categoryTotals.slice(0, 4).map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center`} style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                      {category.icon}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{category.name}</p>
                      <p className="text-xs text-gray-500">{category.transactions} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold font-mono">${category.value.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{Math.round(category.percentage)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
