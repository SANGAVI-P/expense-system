import { useState } from "react";
import { format, parseISO } from "date-fns";
import { MoreHorizontal, Edit, Trash2, Repeat, ArrowUp, ArrowDown, CheckCircle, XCircle } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { RecurringTransaction } from "@/lib/supabase/recurringTransactions";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { AddRecurringTransactionDialog } from "./AddRecurringTransactionDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/utils";

interface RecurringTransactionListProps {
  recurringTransactions: RecurringTransaction[];
  isLoading: boolean;
}

const getAmountColor = (type: RecurringTransaction["type"]) => {
  return type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
};

const getIcon = (type: RecurringTransaction["type"]) => {
  return type === "income" ? <ArrowUp className="h-4 w-4 text-green-600" /> : <ArrowDown className="h-4 w-4 text-red-600" />;
};

const getFrequencyLabel = (frequency: string) => {
  switch (frequency) {
    case 'daily': return 'Daily';
    case 'weekly': return 'Weekly';
    case 'monthly': return 'Monthly';
    default: return frequency;
  }
};

export function RecurringTransactionList({ recurringTransactions, isLoading }: RecurringTransactionListProps) {
  const { deleteRecurringTransaction } = useRecurringTransactions();
  const [selectedTransaction, setSelectedTransaction] = useState<RecurringTransaction | undefined>(undefined);
  
  const handleDelete = async (id: string) => {
    await deleteRecurringTransaction(id);
  };

  const handleEdit = (transaction: RecurringTransaction) => {
    setSelectedTransaction(transaction);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (recurringTransactions.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <span className="text-5xl mb-4 block">🔄</span>
        <p className="text-lg font-semibold">No recurring transactions found.</p>
        <p className="text-sm">Set up automatic payments like rent or subscriptions.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Next Due</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recurringTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium max-w-[200px] truncate">{transaction.description || "N/A"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{transaction.category || "Uncategorized"}</Badge>
                </TableCell>
                <TableCell className="capitalize">{getFrequencyLabel(transaction.frequency)}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {format(parseISO(transaction.next_due_date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="text-center">
                  {transaction.is_active ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                  )}
                </TableCell>
                <TableCell className={`text-right font-semibold flex items-center justify-end space-x-1 ${getAmountColor(transaction.type)}`}>
                  {getIcon(transaction.type)}
                  <span>{formatCurrency(transaction.amount)}</span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the recurring transaction: "{transaction.description || transaction.category}"
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(transaction.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <AddRecurringTransactionDialog
        initialData={selectedTransaction}
        trigger={<></>}
        onTransactionSaved={() => setSelectedTransaction(undefined)}
        key={selectedTransaction?.id || 'new'} 
      />
    </>
  );
}