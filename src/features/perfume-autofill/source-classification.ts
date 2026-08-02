import type { AutofillSourceKind } from "./types";

export interface SourceClassificationPolicy {
  officialHosts: readonly string[];
  specializedHosts: readonly string[];
  technicalHosts: readonly string[];
}

function matchesHost(hostname: string, configuredHost: string) {
  const expected = configuredHost.trim().toLocaleLowerCase("en-US");
  return hostname === expected || hostname.endsWith(`.${expected}`);
}

function matchesAny(hostname: string, hosts: readonly string[]) {
  return hosts.some((host) => matchesHost(hostname, host));
}

export function classifySource(
  value: string,
  policy: SourceClassificationPolicy,
): AutofillSourceKind {
  const hostname = new URL(value).hostname.toLocaleLowerCase("en-US");
  if (matchesAny(hostname, policy.officialHosts)) return "official";
  if (matchesAny(hostname, policy.specializedHosts)) return "specialized";
  if (matchesAny(hostname, policy.technicalHosts)) return "technical";
  return "community";
}

const priorities: Record<AutofillSourceKind, number> = {
  official: 0,
  specialized: 1,
  technical: 2,
  community: 3,
};

export function sourcePriority(kind: AutofillSourceKind) {
  return priorities[kind];
}
