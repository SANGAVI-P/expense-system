import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { BudgetForm } from "./BudgetForm";
import { Budget } from "@/lib/supabase/budgets";
import { format, startOfMonth } from "date-fns";

interface AddBudgetDialogProps {
  initialData?: Budget;
  trigger?: React.ReactNode;
  onBudgetSaved?: () => void;
  month: string; // YYYY-MM-DD format
}

export function AddBudgetDialog({ initialData, trigger, onBudgetSaved, month }: AddBudgetDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    if (onBudgetSaved) {
      onBudgetSaved();
    }
  };

  const title = initialData ? `Edit Budget for ${initialData.category}` : `Set New Budget for ${format(new Date(month), 'MMMM yyyy')}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Set Budget
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <BudgetForm onSuccess={handleSuccess} initialData={initialData} month={month} />
      </DialogContent>
    </Dialog>
  );
}