import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { TransactionCategory, TransactionType } from "./transactions";

export type Frequency = "daily" | "weekly" | "monthly";

export interface RecurringTransaction {
  id: string;
  user_id: string;
  description: string | null;
  amount: number;
  type: TransactionType;
  category: TransactionCategory | null;
  frequency: Frequency;
  start_date: string;
  next_due_date: string;
  is_active: boolean;
  created_at: string;
}

export async function getRecurringTransactions(): Promise<RecurringTransaction[]> {
  const { data, error } = await supabase
    .from("recurring_transactions")
    .select("*")
    .order("next_due_date", { ascending: true });

  if (error) {
    console.error("Error fetching recurring transactions:", error);
    showError("Failed to load recurring transactions.");
    return [];
  }
  return data as RecurringTransaction[];
}

export async function upsertRecurringTransaction(
  data: Omit<RecurringTransaction, "user_id" | "created_at"> & { id?: string | null }
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showError("You must be logged in to manage recurring transactions.");
    return null;
  }

  try {
    const payload = {
      user_id: user.id,
      description: data.description,
      amount: data.amount,
      type: data.type,
      category: data.category,
      frequency: data.frequency,
      start_date: data.start_date,
      next_due_date: data.next_due_date,
      is_active: data.is_active,
    };

    let result;
    if (data.id) {
      // Update existing transaction
      result = await supabase
        .from("recurring_transactions")
        .update(payload)
        .eq("id", data.id)
        .select()
        .single();
    } else {
      // Insert new transaction
      result = await supabase
        .from("recurring_transactions")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) throw result.error;

    showSuccess("Recurring transaction saved successfully!");
    return result.data;
  } catch (error) {
    console.error("Error saving recurring transaction:", error);
    showError("Failed to save recurring transaction.");
    return null;
  }
}

export async function deleteRecurringTransaction(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showError("You must be logged in to delete a recurring transaction.");
    return false;
  }

  try {
    const { error } = await supabase
      .from("recurring_transactions")
      .delete()
      .eq("id", id);

    if (error) throw error;

    showSuccess("Recurring transaction deleted successfully!");
    return true;
  } catch (error) {
    console.error("Error deleting recurring transaction:", error);
    showError("Failed to delete recurring transaction.");
    return false;
  }
}