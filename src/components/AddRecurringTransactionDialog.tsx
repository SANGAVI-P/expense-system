import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { RecurringTransaction } from "@/lib/supabase/recurringTransactions";
import { RecurringTransactionForm } from "./RecurringTransactionForm";

interface AddRecurringTransactionDialogProps {
  initialData?: RecurringTransaction;
  trigger?: React.ReactNode;
  onTransactionSaved?: () => void;
}

export function AddRecurringTransactionDialog({ initialData, trigger, onTransactionSaved }: AddRecurringTransactionDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    if (onTransactionSaved) {
      onTransactionSaved();
    }
  };

  const title = initialData ? "Edit Recurring Transaction" : "Add New Recurring Transaction";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Recurring
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <RecurringTransactionForm onSuccess={handleSuccess} initialData={initialData} />
      </DialogContent>
    </Dialog>
  );
}