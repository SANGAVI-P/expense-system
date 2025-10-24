import Header from "@/components/Header";
import { AppFooter } from "@/components/AppFooter";
import { AddRecurringTransactionDialog } from "@/components/AddRecurringTransactionDialog";
import { RecurringTransactionList } from "@/components/RecurringTransactionList";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";

const RecurringTransactions = () => {
  const { recurringTransactions, isLoading } = useRecurringTransactions();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-foreground">Recurring Transactions</h2>
          <AddRecurringTransactionDialog />
        </div>
        <div className="bg-card shadow-lg rounded-xl border border-border">
          <RecurringTransactionList recurringTransactions={recurringTransactions} isLoading={isLoading} />
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default RecurringTransactions;