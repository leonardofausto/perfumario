import "server-only";

import { zodTextFormat } from "openai/helpers/zod";

import type {
  PerfumeConsolidationModel,
  PerfumeConsolidationModelRequest,
} from "./consolidate";
import { perfumeModelDraftSchema } from "./model-schema";

interface ResponsesClient {
  responses: {
    parse(request: {
      model: string;
      instructions: string;
      input: string;
      store: false;
      reasoning: { effort: "low" };
      text: { format: ReturnType<typeof zodTextFormat> };
    }, options?: { signal?: AbortSignal }): Promise<{ output_parsed: unknown | null }>;
  };
}

export function createOpenAIConsolidationModel(
  client: ResponsesClient,
  options: { model: string },
): PerfumeConsolidationModel {
  return {
    async generate(request: PerfumeConsolidationModelRequest) {
      const response = await client.responses.parse(
        {
          model: options.model,
          instructions: request.system,
          input: request.input,
          store: false,
          reasoning: { effort: "low" },
          text: {
            format: zodTextFormat(
              perfumeModelDraftSchema,
              "perfume_evidence_consolidation",
            ),
          },
        },
        { signal: request.signal },
      );

      if (response.output_parsed === null) {
        throw new Error("A IA não devolveu saída estruturada.");
      }

      return response.output_parsed;
    },
  };
}
