import Header from "@/components/Header";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { AppFooter } from "@/components/AppFooter";
import { TransactionList } from "@/components/TransactionList";
import { useTransactions } from "@/hooks/useTransactions";
import { useState } from "react";

const Index = () => {
  const { transactions, isLoading } = useTransactions();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionSaved = () => {
    // Force re-render/re-fetch by updating key (React Query handles the actual fetch)
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            My Transactions
          </h2>
          <AddTransactionDialog onTransactionSaved={handleTransactionSaved} />
        </div>
        <div className="bg-card shadow-lg rounded-xl border border-border" key={refreshKey}>
          <TransactionList transactions={transactions} isLoading={isLoading} />
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default Index;