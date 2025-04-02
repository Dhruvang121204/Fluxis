import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import AppShell from "@/components/layout/app-shell";
import AddTransactionModal from "@/components/modals/add-transaction-modal";
import { Transaction } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Plus, 
  Search, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Trash2,
  ShoppingCart,
  Home,
  Utensils,
  Car,
  Heart,
  ShoppingBag,
  Gamepad,
  Lightbulb,
  BookOpen,
  User,
  Plane,
  Monitor,
  MoreHorizontal,
  // Bank,
  Briefcase,
  LineChart,
  DollarSign
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Icon mapping for categories
const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'Salary': <Briefcase className="w-5 h-5 text-green-600" />,
    'Freelance': <Briefcase className="w-5 h-5" />,
    'Investments': <LineChart className="w-5 h-5" />,
    'Other Income': <DollarSign className="w-5 h-5" />,
    'Housing': <Home className="w-5 h-5" />,
    'Food & Dining': <Utensils className="w-5 h-5" />,
    'Transportation': <Car className="w-5 h-5" />,
    'Healthcare': <Heart className="w-5 h-5" />,
    'Shopping': <ShoppingBag className="w-5 h-5" />,
    'Entertainment': <Gamepad className="w-5 h-5" />,
    'Utilities': <Lightbulb className="w-5 h-5" />,
    'Education': <BookOpen className="w-5 h-5" />,
    'Personal Care': <User className="w-5 h-5" />,
    'Travel': <Plane className="w-5 h-5" />,
    'Subscriptions': <Monitor className="w-5 h-5" />,
    'Other': <MoreHorizontal className="w-5 h-5" />
  };
  
  return iconMap[category] || <ShoppingCart className="w-5 h-5" />;
};

const getCategoryColor = (category: string) => {
  const colorMap: Record<string, string> = {
    'Salary': 'bg-green-100 text-green-600',
    'Freelance': 'bg-blue-100 text-blue-600',
    'Investments': 'bg-purple-100 text-purple-600',
    'Other Income': 'bg-indigo-100 text-indigo-600',
    'Housing': 'bg-blue-100 text-blue-600',
    'Food & Dining': 'bg-green-100 text-green-600',
    'Transportation': 'bg-amber-100 text-amber-600',
    'Healthcare': 'bg-red-100 text-red-600',
    'Shopping': 'bg-pink-100 text-pink-600',
    'Entertainment': 'bg-purple-100 text-purple-600',
    'Utilities': 'bg-amber-100 text-amber-600',
    'Education': 'bg-blue-100 text-blue-600',
    'Personal Care': 'bg-pink-100 text-pink-600',
    'Travel': 'bg-indigo-100 text-indigo-600',
    'Subscriptions': 'bg-red-100 text-red-600',
    'Other': 'bg-gray-100 text-gray-600'
  };
  
  return colorMap[category] || 'bg-gray-100 text-gray-600';
};

export default function TransactionsPage() {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // all, income, expense
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const handleDeleteTransaction = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/transactions/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Transaction deleted",
        description: "The transaction has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  // Filter and search transactions
  const filteredTransactions = transactions?.filter(transaction => {
    // Apply type filter
    if (filter !== "all" && transaction.type !== filter) {
      return false;
    }
    
    // Apply search filter
    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase();
      return (
        transaction.description?.toLowerCase().includes(search) ||
        transaction.category.toLowerCase().includes(search)
      );
    }
    
    return true;
  }) || [];

  return (
    <AppShell
      title="Transactions"
      subtitle="Manage your income and expenses"
      activePage="transactions"
    >
      <div className="p-4 space-y-6 pb-20">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>View and manage your transactions</CardDescription>
            </div>
            <Button onClick={() => setIsAddTransactionOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </CardHeader>
          <CardContent>
            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search transactions..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="income">Income Only</SelectItem>
                  <SelectItem value="expense">Expenses Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transactions List */}
            <div className="space-y-4">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg border">
                    <div className="flex items-center">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="ml-3">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24 mt-1" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No transactions found</p>
                  <Button 
                    className="mt-4" 
                    variant="outline"
                    onClick={() => setIsAddTransactionOpen(true)}
                  >
                    Add Your First Transaction
                  </Button>
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex justify-between items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full ${getCategoryColor(transaction.category)} flex items-center justify-center`}>
                        {getCategoryIcon(transaction.category)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">
                          {transaction.description || transaction.category}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(transaction.date), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={`font-semibold font-mono ${
                        transaction.type === 'income' 
                          ? 'text-success-500' 
                          : 'text-danger-500'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        ${Number(transaction.amount).toFixed(2)}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal 
        isOpen={isAddTransactionOpen} 
        onClose={() => setIsAddTransactionOpen(false)} 
      />
    </AppShell>
  );
}
