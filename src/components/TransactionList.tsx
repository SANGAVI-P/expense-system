import { useState, useMemo } from "react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { MoreHorizontal, Edit, Trash2, DollarSign, ArrowUp, ArrowDown, FileText } from "lucide-react";
import { DateRange } from "react-day-picker";

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
import { Transaction } from "@/lib/supabase/transactions";
import { useTransactions } from "@/hooks/useTransactions";
import { AddTransactionDialog } from "./AddTransactionDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TransactionFilters } from "./TransactionFilters";
import { formatCurrency } from "@/lib/utils";
import { getSignedReceiptUrl } from "@/lib/supabase/receipts";
import { showError } from "@/utils/toast";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const getAmountColor = (type: Transaction["type"]) => {
  return type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
};

const getIcon = (type: Transaction["type"]) => {
  return type === "income" ? <ArrowUp className="h-4 w-4 text-green-600" /> : <ArrowDown className="h-4 w-4 text-red-600" />;
};

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
  const { deleteTransaction } = useTransactions();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);
  
  // Filter State
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };
  
  const handleViewReceipt = async (receiptPath: string) => {
    const url = await getSignedReceiptUrl(receiptPath);
    if (url) {
      window.open(url, '_blank');
    } else {
      showError("Could not generate receipt link.");
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory(undefined);
    setDateRange(undefined);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Category Filter
      if (selectedCategory && transaction.category !== selectedCategory) {
        return false;
      }

      // Date Range Filter
      if (dateRange?.from) {
        const transactionDate = parseISO(transaction.transaction_date);
        const start = dateRange.from;
        const end = dateRange.to || new Date(); // If 'to' is not set, filter up to today

        if (!isWithinInterval(transactionDate, { start, end })) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, selectedCategory, dateRange]);


  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const showEmptyState = transactions.length === 0;
  const showNoResults = transactions.length > 0 && filteredTransactions.length === 0;

  return (
    <>
      <TransactionFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onClearFilters={handleClearFilters}
      />

      {showEmptyState ? (
        <div className="p-8 text-center text-muted-foreground">
          <DollarSign className="mx-auto h-12 w-12 mb-4 text-primary/50" />
          <p className="text-lg font-semibold">No transactions recorded yet.</p>
          <p className="text-sm">Start by adding your first expense or income.</p>
        </div>
      ) : showNoResults ? (
        <div className="p-8 text-center text-muted-foreground">
          <Filter className="mx-auto h-12 w-12 mb-4 text-primary/50" />
          <p className="text-lg font-semibold">No results found.</p>
          <p className="text-sm">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {format(new Date(transaction.transaction_date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{transaction.description || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{transaction.category || "Uncategorized"}</Badge>
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
                        
                        {transaction.receipt_path && (
                          <DropdownMenuItem onClick={() => handleViewReceipt(transaction.receipt_path!)}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Receipt
                          </DropdownMenuItem>
                        )}
                        
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
                                This action cannot be undone. This will permanently delete the transaction: "{transaction.description || transaction.category}"
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
      )}

      {/* Edit Dialog - Controlled by selectedTransaction state */}
      <AddTransactionDialog
        initialData={selectedTransaction}
        trigger={<></>} // Hide default trigger
        onTransactionSaved={() => setSelectedTransaction(undefined)}
        // We use a key to force re-render when selectedTransaction changes, ensuring the dialog opens correctly
        key={selectedTransaction?.id || 'new'} 
      />
    </>
  );
}