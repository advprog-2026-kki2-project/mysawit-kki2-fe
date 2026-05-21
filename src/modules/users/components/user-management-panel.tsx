"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { RefreshCcw, Trash2, UserCheck, UserMinus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/modules/auth/data/auth-api";
import { roleLabels, roleOptions, type Role } from "@/modules/auth/data/types";
import {
  assignForeman,
  deleteUser,
  getUsers,
  unassignForeman,
} from "@/modules/users/data/users-api";
import type { User } from "@/modules/users/data/types";

export function UserManagementPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState<Role | "ALL">("ALL");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [assignment, setAssignment] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const foremen = useMemo(
    () => users.filter((user) => user.role === "FOREMAN"),
    [users],
  );

  async function loadUsers() {
    setIsLoading(true);
    setError(null);

    try {
      setUsers(await getUsers({ role, name, email }));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError || caughtError instanceof Error
          ? caughtError.message
          : "Data pengguna tidak dapat dimuat.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadUsers();
  }

  async function handleAssign(laborer: User) {
    const foremanId = Number(assignment[laborer.id]);
    if (!foremanId) {
      setError("Pilih mandor terlebih dahulu.");
      return;
    }

    try {
      await assignForeman(laborer.id, foremanId);
      setFeedback(`Buruh ${laborer.username} berhasil ditugaskan.`);
      await loadUsers();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError || caughtError instanceof Error
          ? caughtError.message
          : "Assignment gagal.",
      );
    }
  }

  async function handleUnassign(laborer: User) {
    try {
      await unassignForeman(laborer.id);
      setFeedback(`Assignment ${laborer.username} berhasil dicopot.`);
      await loadUsers();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError || caughtError instanceof Error
          ? caughtError.message
          : "Unassignment gagal.",
      );
    }
  }

  async function handleDelete(user: User) {
    try {
      await deleteUser(user.id);
      setFeedback(`Pengguna ${user.username} berhasil dihapus.`);
      await loadUsers();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError || caughtError instanceof Error
          ? caughtError.message
          : "Pengguna gagal dihapus.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-white p-6 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
        <form className="grid gap-3 lg:grid-cols-[1fr_1fr_12rem_auto]" onSubmit={handleSearch}>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Cari nama"
          />
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Cari email"
          />
          <Select value={role} onValueChange={(value) => setRole(value as Role | "ALL")}>
            <SelectTrigger className="h-12 w-full px-5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua role</SelectItem>
              {roleOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {roleLabels[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={isLoading}>
            <RefreshCcw className="size-4" />
            {isLoading ? "Memuat..." : "Filter"}
          </Button>
        </form>
      </section>

      {feedback ? (
        <p className="rounded-lg border border-[rgba(63,105,1,0.18)] bg-[rgba(205,237,174,0.55)] px-4 py-3 text-sm">
          {feedback}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-[rgba(186,26,26,0.25)] bg-[rgba(186,26,26,0.06)] px-4 py-3 text-sm text-[#93000a]">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4">
        {users.map((user) => (
          <article
            key={user.id}
            className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)]"
          >
            <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
              <div>
                <p className="mono-label text-[#74796d]">{roleLabels[user.role]}</p>
                <h2 className="mt-2 text-xl font-semibold text-[#1a1c18]">
                  {user.username}
                </h2>
                <p className="mt-1 text-sm text-[#44483e]">{user.email}</p>
                {user.role === "LABORER" ? (
                  <p className="mt-2 text-sm text-[#44483e]">
                    Mandor: {user.foremanId ?? "Belum ditugaskan"}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                {user.role === "LABORER" ? (
                  <>
                    <Select
                      value={assignment[user.id] ?? ""}
                      onValueChange={(value) =>
                        setAssignment((current) => ({ ...current, [user.id]: value }))
                      }
                    >
                      <SelectTrigger className="h-11 w-full min-w-52 px-4 sm:w-56">
                        <SelectValue placeholder="Pilih mandor" />
                      </SelectTrigger>
                      <SelectContent>
                        {foremen.map((foreman) => (
                          <SelectItem key={foreman.id} value={String(foreman.id)}>
                            {foreman.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="secondary" onClick={() => void handleAssign(user)}>
                      <UserCheck className="size-4" />
                      Assign
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => void handleUnassign(user)}>
                      <UserMinus className="size-4" />
                      Copot
                    </Button>
                  </>
                ) : null}
                <Button type="button" variant="ghost" onClick={() => void handleDelete(user)}>
                  <Trash2 className="size-4" />
                  Hapus
                </Button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
