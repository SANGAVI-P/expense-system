import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BudgetForm } from "./BudgetForm";
import { Budget } from "@/lib/supabase/budgets";

interface AddBudgetDialogProps {
  initialData?: Budget;
  onBudgetSaved?: () => void;
  month: string; // YYYY-MM-DD format
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddBudgetDialog({ initialData, onBudgetSaved, month, open, onOpenChange }: AddBudgetDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
    if (onBudgetSaved) {
      onBudgetSaved();
    }
  };

  const title = initialData ? `Edit Budget for ${initialData.category}` : `Set New Budget for ${format(new Date(month), 'MMMM yyyy')}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <BudgetForm onSuccess={handleSuccess} initialData={initialData} month={month} />
      </DialogContent>
    </Dialog>
  );
}