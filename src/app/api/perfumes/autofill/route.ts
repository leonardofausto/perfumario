import { getOptionalUser } from "@/lib/auth/session";
import { executeConfiguredAutofill } from "@/features/perfume-autofill/runtime";

import { createAutofillRoute } from "./handler";

export const runtime = "nodejs";
export const maxDuration = 30;

export const POST = createAutofillRoute({
  getUser: getOptionalUser,
  execute: executeConfiguredAutofill,
});
