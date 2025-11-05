import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  updated_at: string;
}

// Get the current user's profile
export async function getProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data;
}

// Update the user's profile data
export async function updateProfile(profileData: { first_name: string; last_name: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showError("You must be logged in to update your profile.");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;

    showSuccess("Profile updated successfully!");
    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    showError("Failed to update profile.");
    return null;
  }
}

// Update the user's password
export async function updateUserPassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error("Error updating password:", error);
    showError(error.message);
    return false;
  }

  showSuccess("Password updated successfully!");
  return true;
}