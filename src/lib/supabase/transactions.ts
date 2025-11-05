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
  receipt_path: string | null; // Added receipt_path
}

export async function addTransaction(
  data: Omit<Transaction, "id" | "user_id" | "created_at" | "receipt_path">,
  receiptFile: File | null,
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showError("You must be logged in to add a transaction.");
    return;
  }

  let receiptPath: string | null = null;

  try {
    // 1. Insert transaction data (without receipt path initially)
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
      receiptPath = filePath;

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
        // We proceed to update the transaction with the path only if upload succeeded, 
        // but since it failed, we keep receiptPath null for the update below.
        receiptPath = null; 
      }
    }
    
    // 3. Update transaction with receipt path if upload was successful
    if (receiptPath) {
        const { error: updateError } = await supabase
            .from("transactions")
            .update({ receipt_path: receiptPath })
            .eq("id", transactionData.id);

        if (updateError) {
            console.error("Error updating transaction with receipt path:", updateError);
            showError("Transaction added, but failed to link receipt path.");
        }
    }


    showSuccess("Transaction added successfully!");
    return { ...transactionData, receipt_path: receiptPath };
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
  data: Omit<Transaction, "id" | "user_id" | "created_at" | "receipt_path">,
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showError("You must be logged in to update a transaction.");
    return;
  }

  try {
    // Note: Receipt file upload/update is not handled here for simplicity in update flow.
    // If the user wants to update the receipt, they would need a separate flow.
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
    // 1. Fetch transaction to get receipt path (if needed for storage deletion)
    const { data: transaction, error: fetchError } = await supabase
        .from("transactions")
        .select("receipt_path")
        .eq("id", id)
        .single();

    if (fetchError) throw fetchError;

    // 2. Delete transaction record
    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;
    
    // 3. Delete receipt file from storage if path exists
    if (transaction?.receipt_path) {
        const { error: storageError } = await supabase.storage
            .from('receipts')
            .remove([transaction.receipt_path]);
        
        if (storageError) {
            console.warn("Warning: Failed to delete associated receipt file:", storageError);
            // Do not throw, as the transaction record deletion was successful.
        }
    }

    showSuccess("Transaction deleted successfully!");
    return true;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    showError("Failed to delete transaction.");
    return false;
  }
}