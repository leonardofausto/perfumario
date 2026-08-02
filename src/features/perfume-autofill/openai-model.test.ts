import { describe, expect, it, vi } from "vitest";

import { createOpenAIConsolidationModel } from "./openai-model";

describe("OpenAI perfume consolidation model", () => {
  it("uses Responses structured output with trusted instructions kept separate", async () => {
    const parse = vi.fn().mockResolvedValue({
      output_parsed: { fields: {}, explanation: null },
    });
    const model = createOpenAIConsolidationModel(
      { responses: { parse } },
      { model: "gpt-5.6-terra" },
    );

    const controller = new AbortController();
    const result = await model.generate({
      system: "trusted-system",
      input: "<external_evidence>untrusted</external_evidence>",
      repairIssues: [],
      signal: controller.signal,
    });

    expect(result).toEqual({ fields: {}, explanation: null });
    expect(parse).toHaveBeenCalledOnce();
    expect(parse).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-5.6-terra",
        instructions: "trusted-system",
        input: "<external_evidence>untrusted</external_evidence>",
        store: false,
        text: { format: expect.objectContaining({ type: "json_schema" }) },
      }),
      { signal: controller.signal },
    );
  });

  it("fails closed when the model has no parsed structured output", async () => {
    const model = createOpenAIConsolidationModel(
      {
        responses: {
          parse: vi.fn().mockResolvedValue({ output_parsed: null }),
        },
      },
      { model: "gpt-5.6-terra" },
    );

    await expect(
      model.generate({ system: "system", input: "input", repairIssues: [] }),
    ).rejects.toThrow("saída estruturada");
  });
});
