import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createServerSupabase } from "../supabase/server";

export async function getOptionalUser(): Promise<User | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getOptionalUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
