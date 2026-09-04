import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";

export const meKey = ["auth", "me"] as const;

/**
 * TanStack Query session helpers.
 *
 * `endSession` signs the user out of Supabase and wipes the query cache so
 * stale data does not outlive the session.
 */
export function useSession() {
  const qc = useQueryClient();

  return {
    /** Clear any cached data that might belong to a previous user. */
    beginSession: async () => {
      qc.clear();
    },
    /** Sign out and destroy cached queries. */
    endSession: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) console.error("[DigiCon] Sign out failed:", error);
      qc.clear();
      qc.setQueryData(meKey, null);
    },
  };
}
