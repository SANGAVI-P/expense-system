import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile, updateUserPassword, Profile } from "@/lib/supabase/profiles";

const PROFILE_QUERY_KEY = ["profile"];

export function useProfile() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery<Profile | null>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getProfile,
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: updateUserPassword,
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutateAsync,
    updatePassword: updatePasswordMutation.mutateAsync,
  };
}