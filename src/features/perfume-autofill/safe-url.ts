import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export type ResolveHost = (hostname: string) => Promise<readonly string[]>;

function parseIpv4(value: string) {
  const parts = value.split(".").map(Number);
  return parts.length === 4 &&
    parts.every((part) => Number.isInteger(part) && part >= 0 && part <= 255)
    ? parts
    : null;
}

function isBlockedIpv4(value: string) {
  const parts = parseIpv4(value);
  if (!parts) return true;
  const [a, b] = parts;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51) ||
    (a === 203 && b === 0) ||
    a >= 224
  );
}

function isBlockedIpv6(value: string) {
  const normalized = value.toLocaleLowerCase("en-US").replace(/^\[|\]$/g, "");
  if (normalized.startsWith("::ffff:")) {
    return isBlockedIpv4(normalized.slice("::ffff:".length));
  }

  const firstGroup = Number.parseInt(normalized.split(":")[0] || "0", 16);
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("2001:db8:") ||
    (firstGroup >= 0xfc00 && firstGroup <= 0xfdff) ||
    (firstGroup >= 0xfe80 && firstGroup <= 0xfebf) ||
    (firstGroup >= 0xff00 && firstGroup <= 0xffff)
  );
}

function isBlockedAddress(value: string) {
  const version = isIP(value.replace(/^\[|\]$/g, ""));
  if (version === 4) return isBlockedIpv4(value);
  if (version === 6) return isBlockedIpv6(value);
  return true;
}

export const resolvePublicHost: ResolveHost = async (hostname) => {
  const addresses = await lookup(hostname, { all: true, verbatim: true });
  return addresses.map(({ address }) => address);
};

export async function validatePublicHttpUrl(
  value: string,
  resolveHost: ResolveHost = resolvePublicHost,
) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("URL externa não permitida.");
  }

  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.username ||
    url.password ||
    !url.hostname ||
    url.hostname === "localhost" ||
    url.hostname.endsWith(".localhost")
  ) {
    throw new Error("URL externa não permitida.");
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = isIP(hostname) ? [hostname] : await resolveHost(hostname);
  if (addresses.length === 0 || addresses.some(isBlockedAddress)) {
    throw new Error("URL aponta para endereço de rede não permitido.");
  }

  url.hash = "";
  return url;
}
