import Header from "@/components/Header";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { AppFooter } from "@/components/AppFooter";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-foreground">My Expenses</h2>
          <AddTransactionDialog />
        </div>
        <div className="bg-card shadow-lg rounded-xl border border-border">
          <div className="p-8 text-center text-muted-foreground">
            <p>You have no expenses yet.</p>
            <p className="text-sm">Click "Add Transaction" to get started.</p>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default Index;