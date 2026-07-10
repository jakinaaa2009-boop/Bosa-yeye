import { getCallApiAdminConfigStatus } from "@/lib/callapiadmin-gate";

export default function CallApiAdminSetup() {
  const status = getCallApiAdminConfigStatus();

  const missing: string[] = [];
  if (!status.enabledFlag) missing.push("ENABLE_CALLAPIADMIN=true");
  if (!status.hasUsername) missing.push("CALLAPIADMIN_USERNAME");
  if (!status.hasPasswordHash) {
    missing.push(
      "CALLAPIADMIN_PASSWORD_HASH_B64 (recommended on Vercel) or CALLAPIADMIN_PASSWORD_HASH"
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0a08] text-cream flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-coffee-brown/40 border border-gold/20 rounded-2xl p-8 space-y-4">
        <h1 className="text-2xl font-bold text-gold">CallApiAdmin</h1>
        <p className="text-cream/70 text-sm">
          Panel is not configured yet. Add these environment variables on Vercel,
          then redeploy.
        </p>

        {missing.length > 0 && (
          <ul className="list-disc list-inside text-sm text-warning space-y-1">
            {missing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}

        <div className="text-sm text-cream/60 space-y-2 border-t border-gold/10 pt-4">
          <p className="font-medium text-gold-light">Vercel tip</p>
          <p>
            Bcrypt hashes contain <code className="text-cream">$</code> which
            Vercel may corrupt. Use base64 instead:
          </p>
          <pre className="bg-black/40 rounded-lg p-3 text-xs overflow-x-auto">
            {`npm run callapiadmin:hash -- your-password

# Then set on Vercel:
CALLAPIADMIN_PASSWORD_HASH_B64=<printed base64 value>`}
          </pre>
          <p>Also set: CALLAPIADMIN_SESSION_SECRET (long random string)</p>
        </div>
      </div>
    </div>
  );
}
