"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "./Button";
import Input from "./Input";
import { CALLAPIADMIN_CSRF_HEADER } from "@/lib/callapiadmin-constants";
import { formatDateTime, maskPhone } from "@/lib/utils";

interface TestUser {
  id: string;
  phone: string;
  email: string;
  age: number;
  remainingEntries: number;
}

interface ActiveOverride {
  userId: string;
  userPhone: string;
  userEmail: string;
  keepActive: boolean;
  setByUsername: string;
  createdAt: string;
}

interface AuditEntry {
  id: string;
  action: string;
  adminUsername: string;
  selectedUserId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

function apiHeaders(csrfToken: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    [CALLAPIADMIN_CSRF_HEADER]: csrfToken,
  };
}

export default function CallApiAdminPanel() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<TestUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [keepActive, setKeepActive] = useState(false);
  const [override, setOverride] = useState<ActiveOverride | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const refreshSession = useCallback(async () => {
    const res = await fetch("/api/callapiadmin/me", { credentials: "include" });
    if (!res.ok) {
      setAuthenticated(false);
      setLoading(false);
      return;
    }
    const data = await res.json();
    if (data.csrfToken) setCsrfToken(data.csrfToken);
    setAuthenticated(Boolean(data.authenticated));
    if (data.username) setUsername(data.username);
    setLoading(false);
  }, []);

  const loadOverride = useCallback(async () => {
    const res = await fetch("/api/callapiadmin/override", {
      credentials: "include",
    });
    if (!res.ok) return;
    const data = await res.json();
    setOverride(data.override);
  }, []);

  const loadAudit = useCallback(async () => {
    const res = await fetch("/api/callapiadmin/audit", {
      credentials: "include",
    });
    if (!res.ok) return;
    const data = await res.json();
    setAuditLogs(data.logs || []);
  }, []);

  const loadUsers = useCallback(async (query: string) => {
    setUsersLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    const res = await fetch(`/api/callapiadmin/users?${params}`, {
      credentials: "include",
    });
    setUsersLoading(false);
    if (!res.ok) return;
    const data = await res.json();
    setUsers(data.users || []);
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (!authenticated) return;
    loadOverride();
    loadAudit();
    loadUsers("");
  }, [authenticated, loadOverride, loadAudit, loadUsers]);

  useEffect(() => {
    if (!authenticated) return;
    const timer = setTimeout(() => loadUsers(search), 300);
    return () => clearTimeout(timer);
  }, [search, authenticated, loadUsers]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/callapiadmin/login", {
        method: "POST",
        credentials: "include",
        headers: apiHeaders(csrfToken),
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.message || "Login failed");
        await refreshSession();
        return;
      }
      if (data.csrfToken) setCsrfToken(data.csrfToken);
      setAuthenticated(true);
      setUsername(data.username);
      setLoginForm({ username: "", password: "" });
    } catch {
      setLoginError("Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/callapiadmin/logout", {
      method: "POST",
      credentials: "include",
      headers: apiHeaders(csrfToken),
    });
    setAuthenticated(false);
    setUsername("");
    setOverride(null);
    setAuditLogs([]);
    setUsers([]);
    await refreshSession();
  };

  const handleSetOverride = async () => {
    setActionMessage("");
    setActionError("");
    if (!selectedUserId) {
      setActionError("Select a test user first");
      return;
    }

    const res = await fetch("/api/callapiadmin/override", {
      method: "POST",
      credentials: "include",
      headers: apiHeaders(csrfToken),
      body: JSON.stringify({ userId: selectedUserId, keepActive }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setActionError(data.message || "Failed to set override");
      return;
    }
    setOverride(data.override);
    setActionMessage("Test winner override is active for the next Lucky Spin.");
    loadAudit();
  };

  const handleClearOverride = async () => {
    setActionMessage("");
    setActionError("");
    const res = await fetch("/api/callapiadmin/override", {
      method: "DELETE",
      credentials: "include",
      headers: apiHeaders(csrfToken),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setActionError(data.message || "Failed to clear override");
      return;
    }
    setOverride(null);
    setActionMessage("Override cleared.");
    loadAudit();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-cream/60">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0a08] text-cream">
      <div className="bg-warning/20 border-b border-warning/50 px-4 py-3 text-center text-sm text-warning font-medium">
        LOCAL DEVELOPMENT ONLY — Lucky Spin test override panel. Not available in
        production. Do not share this URL.
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header>
          <h1 className="text-2xl font-bold text-gold">CallApiAdmin</h1>
          <p className="text-cream/50 text-sm mt-1">
            Local-only Lucky Spin testing and winner override
          </p>
        </header>

        {!authenticated ? (
          <form
            onSubmit={handleLogin}
            className="max-w-md space-y-4 bg-coffee-brown/40 border border-gold/20 rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-gold-light">Login</h2>
            {loginError && (
              <p className="text-danger text-sm">{loginError}</p>
            )}
            <Input
              label="Username"
              value={loginForm.username}
              onChange={(e) =>
                setLoginForm((f) => ({ ...f, username: e.target.value }))
              }
              autoComplete="username"
              required
            />
            <Input
              label="Password"
              type="password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm((f) => ({ ...f, password: e.target.value }))
              }
              autoComplete="current-password"
              required
            />
            <Button type="submit" loading={loginLoading} className="w-full">
              Sign in
            </Button>
          </form>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-cream/70 text-sm">
                Signed in as{" "}
                <span className="text-gold font-medium">{username}</span>
              </p>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>

            {actionMessage && (
              <p className="text-success text-sm bg-success/10 border border-success/30 rounded-xl px-4 py-3">
                {actionMessage}
              </p>
            )}
            {actionError && (
              <p className="text-danger text-sm bg-danger/10 border border-danger/30 rounded-xl px-4 py-3">
                {actionError}
              </p>
            )}

            <section className="bg-coffee-brown/40 border border-gold/20 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gold-light">
                Active override
              </h2>
              {override ? (
                <div className="text-sm space-y-1 text-cream/80">
                  <p>
                    User: {maskPhone(override.userPhone)} ({override.userEmail})
                  </p>
                  <p>User ID: {override.userId}</p>
                  <p>
                    Keep active after spin:{" "}
                    {override.keepActive ? "Yes" : "No"}
                  </p>
                  <p>Set by: {override.setByUsername}</p>
                  <p>Set at: {formatDateTime(override.createdAt)}</p>
                  <Button
                    variant="danger"
                    size="sm"
                    className="mt-3"
                    onClick={handleClearOverride}
                  >
                    Clear override
                  </Button>
                </div>
              ) : (
                <p className="text-cream/50 text-sm">No active override.</p>
              )}
            </section>

            <section className="bg-coffee-brown/40 border border-gold/20 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gold-light">
                Set next Lucky Spin winner
              </h2>
              <Input
                label="Search test users (phone or email)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
              />
              <div className="max-h-64 overflow-y-auto border border-gold/15 rounded-xl divide-y divide-gold/10">
                {usersLoading ? (
                  <p className="p-4 text-cream/50 text-sm">Loading users...</p>
                ) : users.length === 0 ? (
                  <p className="p-4 text-cream/50 text-sm">No users found.</p>
                ) : (
                  users.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-start gap-3 p-3 cursor-pointer hover:bg-gold/5"
                    >
                      <input
                        type="radio"
                        name="testUser"
                        value={user.id}
                        checked={selectedUserId === user.id}
                        onChange={() => setSelectedUserId(user.id)}
                        className="mt-1"
                      />
                      <div className="text-sm">
                        <p className="text-cream">
                          {maskPhone(user.phone)} — {user.email}
                        </p>
                        <p className="text-cream/50">
                          Remaining entries: {user.remainingEntries}
                          {user.remainingEntries === 0 && (
                            <span className="text-warning ml-2">
                              (not eligible until approved receipt with entries)
                            </span>
                          )}
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
              <label className="flex items-center gap-2 text-sm text-cream/70">
                <input
                  type="checkbox"
                  checked={keepActive}
                  onChange={(e) => setKeepActive(e.target.checked)}
                />
                Keep override active after spin
              </label>
              <Button onClick={handleSetOverride} disabled={!selectedUserId}>
                Set as next winner
              </Button>
              <p className="text-cream/40 text-xs">
                When an admin runs Lucky Spin (Сугалаа эхлүүлэх), this user will
                win if they have eligible entries. Override is cleared after use
                unless kept active.
              </p>
            </section>

            <section className="bg-coffee-brown/40 border border-gold/20 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gold-light">
                Audit log (local only)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-cream/50 border-b border-gold/15">
                      <th className="text-left py-2 pr-4">Time</th>
                      <th className="text-left py-2 pr-4">Admin</th>
                      <th className="text-left py-2 pr-4">Action</th>
                      <th className="text-left py-2">User ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-cream/40">
                          No audit entries yet.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr
                          key={log.id}
                          className="border-b border-gold/10 text-cream/80"
                        >
                          <td className="py-2 pr-4 whitespace-nowrap">
                            {formatDateTime(log.timestamp)}
                          </td>
                          <td className="py-2 pr-4">{log.adminUsername}</td>
                          <td className="py-2 pr-4">{log.action}</td>
                          <td className="py-2 font-mono text-xs">
                            {log.selectedUserId || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
