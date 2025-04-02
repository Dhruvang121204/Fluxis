import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import AppShell from "@/components/layout/app-shell";
import BalanceOverview from "@/components/finance/balance-overview";
import SpendingInsights from "@/components/finance/spending-insights";
import RecentTransactions from "@/components/finance/recent-transactions";
import FinancialInsights from "@/components/finance/financial-insights";
import FinancialGoals from "@/components/finance/financial-goals";
import FinanceNews from "@/components/finance/finance-news";
import AddTransactionModal from "@/components/modals/add-transaction-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  
  return (
    <AppShell
      title="Fluxis"
      subtitle="Financial Freedom Made Simple"
      activePage="home"
    >
      <div className="p-4 space-y-6 pb-20">
        <BalanceOverview />
        <RecentTransactions />
      </div>

      {/* Add Transaction Button (Floating) */}
      <div className="fixed bottom-20 right-4 z-10">
        <Button 
          size="icon" 
          className="w-14 h-14 rounded-full shadow-lg"
          onClick={() => setIsAddTransactionOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal 
        isOpen={isAddTransactionOpen} 
        onClose={() => setIsAddTransactionOpen(false)} 
      />
    </AppShell>
  );
}
