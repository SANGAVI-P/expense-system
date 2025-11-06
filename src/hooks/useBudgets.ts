import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getBudgets, 
  upsertBudget, 
  deleteBudget, 
  Budget 
} from "@/lib/supabase/budgets";

const BUDGET_QUERY_KEY = ["budgets"];

export function useBudgets(month: string) {
  const queryClient = useQueryClient();

  // Fetch budgets for the specified month
  const { data: budgets, isLoading, error } = useQuery<Budget[]>({
    queryKey: [...BUDGET_QUERY_KEY, month],
    queryFn: () => getBudgets(month),
  });

  // Mutation for adding/updating a budget
  const upsertMutation = useMutation({
    mutationFn: upsertBudget,
    onSuccess: (_data, variables) => {
      // Invalidate the query for the specific month that was changed
      queryClient.invalidateQueries({ queryKey: [...BUDGET_QUERY_KEY, variables.month] });
    },
  });

  // Mutation for deleting a budget
  const deleteMutation = useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      // Invalidate all budget queries as we don't know which month was affected from just the ID
      queryClient.invalidateQueries({ queryKey: BUDGET_QUERY_KEY });
    },
  });

  return {
    budgets: budgets || [],
    isLoading,
    error,
    upsertBudget: upsertMutation.mutateAsync,
    deleteBudget: deleteMutation.mutateAsync,
  };
}