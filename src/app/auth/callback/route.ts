import { NextResponse, type NextRequest } from "next/server";

import { createServerSupabase } from "@/lib/supabase/server";

const allowedDestinations = new Set(["/dashboard", "/redefinir-senha"]);

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedDestination = requestUrl.searchParams.get("next") ?? "/dashboard";
  const destination = allowedDestinations.has(requestedDestination)
    ? requestedDestination
    : "/dashboard";

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(destination, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?erro=link-invalido", requestUrl.origin));
}
