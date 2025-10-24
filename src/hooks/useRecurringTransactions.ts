import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getRecurringTransactions, 
  upsertRecurringTransaction, 
  deleteRecurringTransaction, 
  RecurringTransaction 
} from "@/lib/supabase/recurringTransactions";

const RECURRING_TRANSACTION_QUERY_KEY = ["recurring_transactions"];

export function useRecurringTransactions() {
  const queryClient = useQueryClient();

  // Fetch all recurring transactions
  const { data: recurringTransactions, isLoading, error } = useQuery<RecurringTransaction[]>({
    queryKey: RECURRING_TRANSACTION_QUERY_KEY,
    queryFn: getRecurringTransactions,
  });

  // Mutation for adding/updating a recurring transaction
  const upsertMutation = useMutation({
    mutationFn: upsertRecurringTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECURRING_TRANSACTION_QUERY_KEY });
    },
  });

  // Mutation for deleting a recurring transaction
  const deleteMutation = useMutation({
    mutationFn: deleteRecurringTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECURRING_TRANSACTION_QUERY_KEY });
    },
  });

  return {
    recurringTransactions: recurringTransactions || [],
    isLoading,
    error,
    upsertRecurringTransaction: upsertMutation.mutateAsync,
    deleteRecurringTransaction: deleteMutation.mutateAsync,
  };
}