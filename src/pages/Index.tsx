import { MadeWithDyad } from "@/components/made-with-dyad";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-foreground">My Expenses</h2>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
        <div className="bg-card shadow-lg rounded-xl border border-border">
          <div className="p-8 text-center text-muted-foreground">
            <p>You have no expenses yet.</p>
            <p className="text-sm">Click "Add Expense" to get started.</p>
          </div>
        </div>
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Index;