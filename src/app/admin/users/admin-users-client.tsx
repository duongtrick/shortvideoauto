"use client";

import { useToastState } from "@/app/toast-provider";
import { FormEvent, useEffect, useMemo, useState } from "react";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: "user" | "admin" | "banned" | "deleted";
  credits: number;
  emailVerified: string | null;
  createdAt: string;
  _count: { jobs: number; videos: number; payments: number };
};

type UsersResponse = {
  users: UserRow[];
  total: number;
};

const roles = ["user", "admin", "banned", "deleted"] as const;

export function AdminUsersClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useToastState("");
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const params = new URLSearchParams({ take: "50" });
    if (q.trim()) params.set("q", q.trim());
    if (role) params.set("role", role);
    return params.toString();
  }, [q, role]);

  async function loadUsers() {
    setLoading(true);
    const response = await fetch(`/api/admin/users?${query}`);
    const data = (await response.json()) as UsersResponse;
    setUsers(data.users ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }

  useEffect(() => {
    void loadUsers();
  }, [query]);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        name: form.get("name") || undefined,
        password: form.get("password") || undefined,
        role: form.get("role")
      })
    });
    setMessage(response.ok ? "User created." : "Create user failed.");
    if (response.ok) {
      event.currentTarget.reset();
      await loadUsers();
    }
  }

  async function updateRole(user: UserRow, nextRole: UserRow["role"]) {
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role: nextRole })
    });
    setMessage(response.ok ? "Role updated." : "Update role failed.");
    await loadUsers();
  }

  async function adjustCredits(user: UserRow, rawDelta: string) {
    const delta = Number(rawDelta);
    if (!Number.isInteger(delta) || delta === 0) return setMessage("Credit delta invalid.");
    const response = await fetch(`/api/admin/users/${user.id}/credits`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ delta, note: "Admin UI adjustment" })
    });
    setMessage(response.ok ? "Credits adjusted." : "Credit adjustment failed.");
    await loadUsers();
  }

  async function toggleBan(user: UserRow) {
    const response = await fetch(`/api/admin/users/${user.id}/ban`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ banned: user.role !== "banned" })
    });
    setMessage(response.ok ? "Ban state updated." : "Ban update failed.");
    await loadUsers();
  }

  async function deleteUser(user: UserRow) {
    if (!confirm(`Soft delete ${user.email}?`)) return;
    const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    setMessage(response.ok ? "User soft deleted." : "Delete failed.");
    await loadUsers();
  }

  return (
    <div className="admin-users">
      <section className="panel admin-command">
        <form className="form compact-form" onSubmit={createUser}>
          <h2>Create user</h2>
          <div className="admin-form-grid">
            <label>
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Name
              <input name="name" type="text" autoComplete="name" />
            </label>
            <label>
              Password
              <input name="password" type="password" autoComplete="new-password" minLength={8} />
            </label>
            <label>
              Role
              <select name="role" defaultValue="user">
                {roles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="button primary" type="submit">
            Create
          </button>
        </form>
      </section>

      <section className="panel admin-command">
        <div className="admin-toolbar">
          <label>
            Search
            <input value={q} onChange={(event) => setQ(event.target.value)} type="search" placeholder="email or name" />
          </label>
          <label>
            Role
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="">all</option>
              {roles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <a className="button" href={`/api/admin/users/export?${query}`}>
            Export CSV
          </a>
          <p className="muted">{loading ? "Loading..." : `${total} users`}</p>
        </div>
        {message ? <p className="badge">{message}</p> : null}
      </section>

      <section className="admin-user-list" aria-label="Users">
        {users.length === 0 && !loading ? <div className="panel muted">No users found.</div> : null}
        {users.map((user) => (
          <article className="card admin-user-row" key={user.id}>
            <div className="admin-user-main">
              <strong>{user.email}</strong>
              <span className="muted">{user.name ?? "No name"}</span>
              <span className="badge">{user.role}</span>
            </div>
            <div className="admin-user-stats">
              <span>{user.credits} credits</span>
              <span>{user._count.jobs} jobs</span>
              <span>{user._count.videos} videos</span>
            </div>
            <div className="admin-user-actions">
              <select value={user.role} onChange={(event) => updateRole(user, event.target.value as UserRow["role"])}>
                {roles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <input
                aria-label={`Adjust credits for ${user.email}`}
                type="number"
                step="1"
                placeholder="+/-"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void adjustCredits(user, event.currentTarget.value);
                    event.currentTarget.value = "";
                  }
                }}
              />
              <button className="button" type="button" onClick={() => toggleBan(user)}>
                {user.role === "banned" ? "Unban" : "Ban"}
              </button>
              <button className="button danger" type="button" onClick={() => deleteUser(user)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
