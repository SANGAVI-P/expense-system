import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { AddTransactionForm } from "./AddTransactionForm";
import { Transaction } from "@/lib/supabase/transactions";

interface AddTransactionDialogProps {
  initialData?: Transaction;
  trigger?: React.ReactNode;
  onTransactionSaved?: () => void;
}

export function AddTransactionDialog({ initialData, trigger, onTransactionSaved }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    if (onTransactionSaved) {
      onTransactionSaved();
    }
  };

  const title = initialData ? "Edit Transaction" : "Add New Transaction";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <AddTransactionForm onSuccess={handleSuccess} initialData={initialData} />
      </DialogContent>
    </Dialog>
  );
}