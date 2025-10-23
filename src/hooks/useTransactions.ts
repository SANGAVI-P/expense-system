import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getTransactions, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  Transaction 
} from "@/lib/supabase/transactions";

const TRANSACTION_QUERY_KEY = ["transactions"];

export function useTransactions() {
  const queryClient = useQueryClient();

  // Fetch all transactions
  const { data: transactions, isLoading, error } = useQuery<Transaction[]>({
    queryKey: TRANSACTION_QUERY_KEY,
    queryFn: getTransactions,
  });

  // Mutation for adding a transaction
  const addMutation = useMutation({
    mutationFn: ({ data, receiptFile }: { data: Omit<Transaction, "id" | "user_id" | "created_at">, receiptFile: File | null }) => 
      addTransaction(data, receiptFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTION_QUERY_KEY });
    },
  });

  // Mutation for updating a transaction
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Omit<Transaction, "id" | "user_id" | "created_at"> }) => 
      updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTION_QUERY_KEY });
    },
  });

  // Mutation for deleting a transaction
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTION_QUERY_KEY });
    },
  });

  return {
    transactions: transactions || [],
    isLoading,
    error,
    addTransaction: addMutation.mutateAsync,
    updateTransaction: updateMutation.mutateAsync,
    deleteTransaction: deleteMutation.mutateAsync,
  };
}