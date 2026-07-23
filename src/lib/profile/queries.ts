import "server-only";

import { requireUser } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";

export type OwnProfile = {
  avatarPath: string | null;
  avatarUrl: string | null;
  displayName: string;
};

export async function getOwnProfile(userId: string): Promise<OwnProfile | null> {
  const user = await requireUser();

  if (user.id !== userId) {
    throw new Error("Perfil fora do escopo da sessão.");
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, avatar_path")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  let avatarUrl: string | null = null;
  if (data.avatar_path) {
    const { data: signed } = await supabase.storage
      .from("private-avatars")
      .createSignedUrl(data.avatar_path, 60 * 60);
    avatarUrl = signed?.signedUrl ?? null;
  }

  return {
    avatarPath: data.avatar_path,
    avatarUrl,
    displayName: data.display_name,
  };
}
