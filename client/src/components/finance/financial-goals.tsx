import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FinancialGoal } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import AddGoalModal from "@/components/modals/add-goal-modal";

export default function FinancialGoals() {
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  
  const { data: goals, isLoading } = useQuery<FinancialGoal[]>({
    queryKey: ["/api/goals"],
  });

  // Calculate progress percentage
  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  // Format target date
  const formatTargetDate = (dateString?: string | Date) => {
    if (!dateString) return "Ongoing";
    
    try {
      return format(new Date(dateString), "MMMM yyyy");
    } catch (error) {
      return "Ongoing";
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Financial Goals</h2>
          <Button 
            variant="link" 
            className="text-primary-500 p-0 h-auto"
            onClick={() => setIsAddGoalOpen(true)}
          >
            Add Goal
          </Button>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            // Loading state
            [...Array(2)].map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between">
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))
          ) : goals && goals.length > 0 ? (
            goals.map((goal) => {
              const current = Number(goal.currentAmount);
              const target = Number(goal.targetAmount);
              const percentage = getProgressPercentage(current, target);
              
              return (
                <div key={goal.id}>
                  <div className="flex justify-between mb-1">
                    <div>
                      <p className="text-sm font-medium">{goal.name}</p>
                      <p className="text-xs text-gray-500">
                        Target: {formatTargetDate(goal.targetDate)}
                      </p>
                    </div>
                    <div className="text-sm">
                      <span className="font-mono font-medium">${current.toFixed(0)}</span>
                      <span className="text-gray-500">/</span>
                      <span className="text-gray-500 font-mono">${target.toFixed(0)}</span>
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2 bg-gray-200"
                    indicatorClassName={percentage >= 80 ? "bg-success-500" : "bg-primary-500"}
                  />
                </div>
              );
            })
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No financial goals set</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => setIsAddGoalOpen(true)}
              >
                Create Your First Goal
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <AddGoalModal 
        isOpen={isAddGoalOpen} 
        onClose={() => setIsAddGoalOpen(false)} 
      />
    </Card>
  );
}
