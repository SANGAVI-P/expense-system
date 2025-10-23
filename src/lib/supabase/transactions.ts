import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

export type TransactionType = "expense" | "income";
export type TransactionCategory = "Food" | "Travel" | "Bills" | "Entertainment" | "Salary" | "Other";

export interface Transaction {
  id: string;
  user_id: string;
  description: string | null;
  amount: number;
  type: TransactionType;
  category: TransactionCategory | null;
  transaction_date: string;
  created_at: string;
}

export async function addTransaction(
  data: Omit<Transaction, "id" | "user_id" | "created_at">,
  receiptFile: File | null,
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showError("You must be logged in to add a transaction.");
    return;
  }

  try {
    // 1. Insert transaction data
    const { data: transactionData, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category,
        transaction_date: data.transaction_date,
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // 2. Handle receipt upload if file exists
    if (receiptFile && transactionData) {
      const fileExtension = receiptFile.name.split('.').pop();
      const filePath = `${user.id}/${transactionData.id}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, receiptFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        // Log error but don't fail the whole transaction insertion
        console.error("Error uploading receipt:", uploadError);
        showError("Transaction added, but failed to upload receipt.");
        return transactionData;
      }
    }

    showSuccess("Transaction added successfully!");
    return transactionData;
  } catch (error) {
    console.error("Error adding transaction:", error);
    showError("Failed to add transaction.");
    return null;
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("transaction_date", { ascending: false });

  if (error) {
    console.error("Error fetching transactions:", error);
    showError("Failed to load transactions.");
    return [];
  }
  return data as Transaction[];
}

export async function updateTransaction(
  id: string,
  data: Omit<Transaction, "id" | "user_id" | "created_at">,
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showError("You must be logged in to update a transaction.");
    return;
  }

  try {
    const { error } = await supabase
      .from("transactions")
      .update({
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category,
        transaction_date: data.transaction_date,
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    showSuccess("Transaction updated successfully!");
    return true;
  } catch (error) {
    console.error("Error updating transaction:", error);
    showError("Failed to update transaction.");
    return false;
  }
}

export async function deleteTransaction(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showError("You must be logged in to delete a transaction.");
    return false;
  }

  try {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) throw error;

    showSuccess("Transaction deleted successfully!");
    return true;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    showError("Failed to delete transaction.");
    return false;
  }
}