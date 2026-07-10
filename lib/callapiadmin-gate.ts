function isTruthyEnv(value?: string): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

/** Bcrypt hashes break on Vercel when `$` is in env — use CALLAPIADMIN_PASSWORD_HASH_B64 there. */
export function getCallApiAdminPasswordHash(): string | null {
  const b64 = process.env.CALLAPIADMIN_PASSWORD_HASH_B64?.trim();
  if (b64) {
    try {
      const decoded = Buffer.from(b64, "base64").toString("utf8").trim();
      if (/^\$2[aby]\$/.test(decoded)) return decoded;
    } catch {
      return null;
    }
  }

  const raw = process.env.CALLAPIADMIN_PASSWORD_HASH?.trim();
  if (!raw) return null;
  if (!/^\$2[aby]\$/.test(raw)) return null;
  return raw;
}

export function getCallApiAdminConfigStatus() {
  return {
    enabledFlag: isTruthyEnv(process.env.ENABLE_CALLAPIADMIN),
    hasUsername: Boolean(process.env.CALLAPIADMIN_USERNAME?.trim()),
    hasPasswordHash: Boolean(getCallApiAdminPasswordHash()),
  };
}

/** Enabled when ENABLE_CALLAPIADMIN=true and credentials are configured in env. */
export function isCallApiAdminEnabled(): boolean {
  const status = getCallApiAdminConfigStatus();
  return status.enabledFlag && status.hasUsername && status.hasPasswordHash;
}

export function callApiAdminDisabledResponse() {
  return Response.json({ success: false, message: "Not found" }, { status: 404 });
}
