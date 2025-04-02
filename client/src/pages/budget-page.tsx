import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppShell from "@/components/layout/app-shell";
import { Budget } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddBudgetModal from "@/components/modals/add-budget-modal";
import BudgetProgress from "@/components/finance/budget-progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetPage() {
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  
  const { data: budgets, isLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  return (
    <AppShell 
      title="Budget" 
      subtitle="Set and track your spending limits" 
      activePage="budget"
    >
      <div className="p-4 space-y-6 pb-20">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Budget Management</CardTitle>
              <CardDescription>Track and control your spending</CardDescription>
            </div>
            <Button onClick={() => setIsAddBudgetOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2 mb-6">
                  <div className="flex justify-between mb-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))
            ) : budgets?.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No budgets found</p>
                <Button 
                  className="mt-4" 
                  variant="outline"
                  onClick={() => setIsAddBudgetOpen(true)}
                >
                  Create Your First Budget
                </Button>
              </div>
            ) : (
              <BudgetProgress showManage={false} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budgeting Tips</CardTitle>
            <CardDescription>Smart ways to manage your money</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-blue-100 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-1">The 50/30/20 Rule</h3>
                <p className="text-sm text-blue-700">
                  Allocate 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment.
                </p>
              </div>
              
              <div className="p-4 border border-green-100 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-1">Zero-Based Budgeting</h3>
                <p className="text-sm text-green-700">
                  Assign every dollar a job so your income minus expenses equals zero.
                </p>
              </div>
              
              <div className="p-4 border border-amber-100 bg-amber-50 rounded-lg">
                <h3 className="font-medium text-amber-800 mb-1">Review Regularly</h3>
                <p className="text-sm text-amber-700">
                  Schedule time each week to review your budget and adjust as needed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddBudgetModal
        isOpen={isAddBudgetOpen}
        onClose={() => setIsAddBudgetOpen(false)}
      />
    </AppShell>
  );
}
