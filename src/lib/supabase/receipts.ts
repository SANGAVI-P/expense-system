import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

/**
 * Generates a signed URL for a receipt file stored in the private 'receipts' bucket.
 * @param receiptPath The full path of the receipt file (e.g., 'user_id/transaction_id.pdf').
 * @returns The signed URL string or null if an error occurs.
 */
export async function getSignedReceiptUrl(receiptPath: string): Promise<string | null> {
  try {
    // URL valid for 1 hour (3600 seconds)
    const { data, error } = await supabase.storage
      .from('receipts')
      .createSignedUrl(receiptPath, 3600); 

    if (error) throw error;
    
    return data.signedUrl;
  } catch (error) {
    console.error("Error generating signed receipt URL:", error);
    showError("Failed to retrieve receipt link.");
    return null;
  }
}