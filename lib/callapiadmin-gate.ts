/** Local-only feature gate — returns false in production and when env is unset. */
export function isCallApiAdminEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.ENABLE_CALLAPIADMIN !== "true") return false;
  return Boolean(
    process.env.CALLAPIADMIN_USERNAME?.trim() &&
      process.env.CALLAPIADMIN_PASSWORD_HASH?.trim()
  );
}

export function callApiAdminDisabledResponse() {
  return Response.json({ success: false, message: "Not found" }, { status: 404 });
}
