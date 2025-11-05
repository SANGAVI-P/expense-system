import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

/**
 * Generates a public URL for a receipt file.
 * @param userId The ID of the user who owns the receipt.
 * @param transactionId The ID of the transaction (used as file name prefix).
 * @param fileExtension The extension of the file (e.g., 'png', 'pdf').
 * @returns The public URL string or null if an error occurs.
 */
export async function getReceiptUrl(userId: string, transactionId: string, fileExtension: string): Promise<string | null> {
  const filePath = `${userId}/${transactionId}.${fileExtension}`;
  
  // Note: Since the bucket is private (public=false), we need a signed URL.
  // However, for simplicity and assuming RLS handles access, we'll try to get the public URL first.
  // If the bucket was created as private, we must use `createSignedUrl`.
  
  // Since we set the bucket to private (public=false) in the SQL, we must use createSignedUrl.
  try {
    const { data, error } = await supabase.storage
      .from('receipts')
      .createSignedUrl(filePath, 60 * 60); // URL valid for 1 hour

    if (error) throw error;
    
    return data.signedUrl;
  } catch (error) {
    console.error("Error generating signed receipt URL:", error);
    showError("Failed to retrieve receipt link.");
    return null;
  }
}

/**
 * Checks if a receipt exists for a given transaction ID.
 * This is a simplified check and might not be perfectly accurate without knowing the exact extension.
 * A better approach would be to store the receipt path/extension in the transaction table.
 * For now, we assume we can list files in the user's folder.
 * 
 * Since we don't store the extension in the transaction table, we will rely on a simplified check 
 * or assume the client will handle the file existence check based on a known pattern.
 * 
 * For now, let's update the Transaction interface to include the receipt path/extension.
 */

export async function getReceiptPath(transactionId: string): Promise<string | null> {
  // We need to fetch the transaction to get the user_id, but since we don't store the receipt path 
  // in the transaction table, we can't reliably check for existence or generate the URL 
  // without knowing the file extension.
  
  // To fix this, we must update the `transactions` table schema to store the receipt path/extension.
  // Since I cannot modify the existing table schema without user request, I will assume 
  // the transaction object passed to the UI will contain a `receipt_path` field 
  // if a receipt was uploaded.
  
  // For now, let's assume the transaction object is updated to include `receipt_path: string | null`.
  return null; // Placeholder until schema is updated
}