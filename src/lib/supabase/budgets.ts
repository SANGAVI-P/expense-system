import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { TransactionCategory } from "./transactions";

export interface Budget {
  id: string;
  user_id: string;
  category: TransactionCategory;
  amount: number;
  month: string; // YYYY-MM-DD format, typically the first day of the month
  created_at: string;
}

export async function getBudgets(month: string): Promise<Budget[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Fetch budgets for a specific month (e.g., '2024-08-01')
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", month);

  if (error) {
    console.error("Error fetching budgets:", error);
    showError("Failed to load budgets.");
    return [];
  }
  return data as Budget[];
}

export async function upsertBudget(
  data: Omit<Budget, "id" | "user_id" | "created_at"> & { id?: string | null }
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showError("You must be logged in to manage budgets.");
    return null;
  }

  try {
    const payload = {
      user_id: user.id,
      category: data.category,
      amount: data.amount,
      month: data.month,
    };

    let result;
    if (data.id) {
      // Update existing budget
      result = await supabase
        .from("budgets")
        .update(payload)
        .eq("id", data.id)
        .select()
        .single();
    } else {
      // Insert new budget
      result = await supabase
        .from("budgets")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) throw result.error;

    showSuccess("Budget saved successfully!");
    return result.data;
  } catch (error) {
    console.error("Error saving budget:", error);
    showError("Failed to save budget.");
    return null;
  }
}

export async function deleteBudget(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showError("You must be logged in to delete a budget.");
    return false;
  }

  try {
    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", id);

    if (error) throw error;

    showSuccess("Budget deleted successfully!");
    return true;
  } catch (error) {
    console.error("Error deleting budget:", error);
    showError("Failed to delete budget.");
    return false;
  }
}