import { getOptionalUser } from "@/lib/auth/session";
import { autofillRequestSchema } from "@/features/perfume-autofill/schema";
import type { AutofillServiceOutcome } from "@/features/perfume-autofill/service";
import { executeConfiguredAutofill } from "@/features/perfume-autofill/runtime";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_REQUEST_BYTES = 2_048;

interface RouteDependencies {
  getUser(): Promise<{ id: string } | null>;
  execute(input: {
    userId: string;
    query: { name: string; brand?: string };
    ignoreCache: boolean;
  }): Promise<AutofillServiceOutcome>;
}

const errors = {
  not_found: {
    status: 404,
    body: {
      error: {
        code: "not_found",
        message: "Nenhuma fragrância foi encontrada.",
      },
    },
  },
  rate_limited: {
    status: 429,
    body: {
      error: {
        code: "rate_limited",
        message: "Limite de pesquisas excedido. Tente novamente mais tarde.",
      },
    },
  },
  timeout: {
    status: 504,
    body: {
      error: {
        code: "timeout",
        message: "A pesquisa excedeu o tempo limite.",
      },
    },
  },
  invalid_model: {
    status: 502,
    body: {
      error: {
        code: "invalid_model",
        message: "Não foi possível validar o resultado da pesquisa.",
      },
    },
  },
  internal_error: {
    status: 500,
    body: {
      error: {
        code: "internal_error",
        message: "Não foi possível concluir a pesquisa.",
      },
    },
  },
} as const;

function invalidRequest() {
  return Response.json(
    { error: { code: "invalid_request", message: "Entrada inválida." } },
    { status: 400 },
  );
}

export function createAutofillRoute(dependencies: RouteDependencies) {
  return async function POST(request: Request) {
    let user: { id: string } | null;
    try {
      user = await dependencies.getUser();
    } catch {
      const error = errors.internal_error;
      return Response.json(error.body, {
        status: error.status,
        headers: { "Cache-Control": "private, no-store" },
      });
    }
    if (!user) {
      return Response.json(
        {
          error: {
            code: "unauthorized",
            message: "Autenticação obrigatória.",
          },
        },
        { status: 401 },
      );
    }

    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_REQUEST_BYTES) return invalidRequest();

    let rawBody: string;
    try {
      rawBody = await request.text();
    } catch {
      return invalidRequest();
    }
    if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
      return invalidRequest();
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return invalidRequest();
    }
    const parsed = autofillRequestSchema.safeParse(body);
    if (!parsed.success) return invalidRequest();

    let outcome: AutofillServiceOutcome;
    try {
      outcome = await dependencies.execute({
        userId: user.id,
        query: {
          name: parsed.data.name,
          ...(parsed.data.brand ? { brand: parsed.data.brand } : {}),
        },
        ignoreCache: parsed.data.ignoreCache,
      });
    } catch {
      const error = errors.internal_error;
      return Response.json(error.body, {
        status: error.status,
        headers: { "Cache-Control": "private, no-store" },
      });
    }

    if (outcome.status === "success" || outcome.status === "partial") {
      return Response.json(outcome, {
        status: 200,
        headers: { "Cache-Control": "private, no-store" },
      });
    }

    const error = errors[outcome.status];
    return Response.json(error.body, {
      status: error.status,
      headers: { "Cache-Control": "private, no-store" },
    });
  };
}

export const POST = createAutofillRoute({
  getUser: getOptionalUser,
  execute: executeConfiguredAutofill,
});
