export type TenantDomain = {
  host: string;
  brand: string;
};

export function getConfiguredDomains(value = process.env.APP_DOMAINS ?? ""): TenantDomain[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [host, brand = "ShortVideoAuto"] = item.split(":");
      return { host: host.toLowerCase(), brand };
    });
}

export function resolveTenantDomain(hostHeader: string | null, domains = getConfiguredDomains()) {
  const host = (hostHeader ?? "").split(":")[0].toLowerCase();
  return domains.find((domain) => domain.host === host) ?? { host: host || "localhost", brand: "ShortVideoAuto" };
}
