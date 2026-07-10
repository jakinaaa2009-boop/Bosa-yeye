/** Enabled when ENABLE_CALLAPIADMIN=true and credentials are configured in env. */
export function isCallApiAdminEnabled(): boolean {
  if (process.env.ENABLE_CALLAPIADMIN !== "true") return false;
  return Boolean(
    process.env.CALLAPIADMIN_USERNAME?.trim() &&
      process.env.CALLAPIADMIN_PASSWORD_HASH?.trim()
  );
}

export function callApiAdminDisabledResponse() {
  return Response.json({ success: false, message: "Not found" }, { status: 404 });
}
