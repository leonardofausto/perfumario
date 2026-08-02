import "server-only";

import { load } from "cheerio";

import {
  resolvePublicHost,
  validatePublicHttpUrl,
  type ResolveHost,
} from "./safe-url";
import { readLimitedResponseBody } from "./read-limited-body";

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const ACTIVE_ELEMENTS =
  "script, style, noscript, iframe, frame, object, embed, svg, form, template, link, meta";

export interface CollectedText {
  canonicalUrl: string;
  title: string;
  content: string;
  collectedAt: string;
}

async function fetchWithTimeout(
  fetchImpl: typeof fetch,
  url: URL,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, {
      headers: {
        Accept: "text/html, text/plain;q=0.9",
        "User-Agent": "PerfumarioEvidenceCollector/1.0",
      },
      redirect: "manual",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function compactText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function extractAllowedText(
  body: string,
  contentType: "text/html" | "text/plain",
  maxContentChars: number,
  fallbackTitle: string,
) {
  if (contentType === "text/plain") {
    return {
      title: fallbackTitle,
      content: compactText(body).slice(0, maxContentChars),
    };
  }

  const $ = load(body);
  const title = compactText($("title").first().text()) || fallbackTitle;
  $(ACTIVE_ELEMENTS).remove();
  return {
    title,
    content: compactText($("body").text()).slice(0, maxContentChars),
  };
}

export async function collectPermittedText(
  inputUrl: string,
  options: {
    fetchImpl?: typeof fetch;
    resolveHost?: ResolveHost;
    maxBytes?: number;
    maxContentChars?: number;
    maxRedirects?: number;
    timeoutMs?: number;
    now?: () => Date;
  } = {},
): Promise<CollectedText> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const resolveHost = options.resolveHost ?? resolvePublicHost;
  const maxBytes = Math.max(1, Math.trunc(options.maxBytes ?? 250_000));
  const maxContentChars = Math.max(
    1,
    Math.trunc(options.maxContentChars ?? 20_000),
  );
  const maxRedirects = Math.max(0, Math.trunc(options.maxRedirects ?? 3));
  const timeoutMs = Math.max(1, Math.trunc(options.timeoutMs ?? 5_000));
  let currentUrl = await validatePublicHttpUrl(inputUrl, resolveHost);

  for (let redirectCount = 0; ; redirectCount += 1) {
    const response = await fetchWithTimeout(fetchImpl, currentUrl, timeoutMs);

    if (REDIRECT_STATUSES.has(response.status)) {
      if (redirectCount >= maxRedirects) {
        throw new Error("Redirecionamentos excedem o limite permitido.");
      }
      const location = response.headers.get("location");
      if (!location) {
        throw new Error("Redirecionamento sem destino válido.");
      }
      currentUrl = await validatePublicHttpUrl(
        new URL(location, currentUrl).toString(),
        resolveHost,
      );
      continue;
    }

    if (!response.ok) {
      throw new Error(`Fonte externa respondeu com status ${response.status}.`);
    }

    const rawContentType = response.headers
      .get("content-type")
      ?.split(";")[0]
      .trim()
      .toLocaleLowerCase("en-US");
    if (rawContentType !== "text/html" && rawContentType !== "text/plain") {
      throw new Error("Tipo de conteúdo não permitido.");
    }

    const body = await readLimitedResponseBody(
      response,
      maxBytes,
      "Conteúdo excede o limite permitido.",
    );
    const extracted = extractAllowedText(
      body,
      rawContentType,
      maxContentChars,
      currentUrl.hostname,
    );

    return {
      canonicalUrl: currentUrl.toString(),
      title: extracted.title,
      content: extracted.content,
      collectedAt: (options.now ?? (() => new Date()))().toISOString(),
    };
  }
}
