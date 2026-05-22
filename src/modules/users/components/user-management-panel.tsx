"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Download,
  Mail,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api-client";
import {
  roleLabels,
  roleOptions,
  selfRegistrationRoleOptions,
  type AuthResponse,
  type Role,
} from "@/modules/auth/data/types";
import {
  assignForeman,
  createUser,
  deleteUser,
  getUser,
  getUsers,
  unassignForeman,
} from "@/modules/users/data/users-api";
import type { CreateUserPayload, User } from "@/modules/users/data/types";

type UserManagementPanelProps = {
  session: AuthResponse;
};

type CreateUserForm = {
  username: string;
  email: string;
  password: string;
  role: Role;
  foremanCertificationNumber: string;
};

const initialCreateUserForm: CreateUserForm = {
  username: "",
  email: "",
  password: "",
  role: "LABORER",
  foremanCertificationNumber: "",
};

function formatUserCode(user: User) {
  const prefix =
    user.role === "FOREMAN"
      ? "MD"
      : user.role === "LABORER"
        ? "BR"
        : user.role === "DRIVER"
          ? "SP"
          : "AD";

  return `${prefix}-${String(user.id).padStart(4, "0")}`;
}

function readError(caughtError: unknown, fallback: string) {
  return caughtError instanceof ApiError || caughtError instanceof Error
    ? caughtError.message
    : fallback;
}

function csvValue(value: string | number | null | undefined) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function UserManagementPanel({ session }: UserManagementPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState<Role | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [foremanSearch, setForemanSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateUserForm>(
    initialCreateUserForm,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const foremen = useMemo(
    () => users.filter((user) => user.role === "FOREMAN"),
    [users],
  );

  const userById = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users],
  );

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = role === "ALL" || user.role === role;
      const matchesSearch =
        !query ||
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        formatUserCode(user).toLowerCase().includes(query);

      return matchesRole && matchesSearch;
    });
  }, [role, search, users]);

  const stats = useMemo(
    () => ({
      total: users.length,
      foremen: foremen.length,
      laborers: users.filter((user) => user.role === "LABORER").length,
      unassignedLaborers: users.filter(
        (user) => user.role === "LABORER" && user.foremanId === null,
      ).length,
    }),
    [foremen.length, users],
  );

  async function loadUsers(nextSelectedUserId = selectedUser?.id) {
    setIsLoading(true);
    setError(null);

    try {
      const loadedUsers = await getUsers();
      setUsers(loadedUsers);

      if (nextSelectedUserId) {
        setSelectedUser(
          loadedUsers.find((user) => user.id === nextSelectedUserId) ?? null,
        );
      }
    } catch (caughtError) {
      setError(readError(caughtError, "Data pengguna tidak dapat dimuat."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleViewDetails(userId: number) {
    setIsDetailLoading(true);
    setError(null);

    try {
      setSelectedUser(await getUser(userId));
      setForemanSearch("");
    } catch (caughtError) {
      setError(readError(caughtError, "Detail pengguna tidak dapat dimuat."));
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionKey("create-user");
    setError(null);
    setFeedback(null);

    const payload: CreateUserPayload = {
      username: createForm.username.trim(),
      email: createForm.email.trim(),
      password: createForm.password,
      role: createForm.role,
      foremanCertificationNumber:
        createForm.role === "FOREMAN"
          ? createForm.foremanCertificationNumber.trim()
          : undefined,
    };

    try {
      await createUser(payload);
      setFeedback(`Pengguna ${payload.username} berhasil dibuat.`);
      setCreateForm(initialCreateUserForm);
      setIsCreateOpen(false);
      await loadUsers();
    } catch (caughtError) {
      setError(readError(caughtError, "Pengguna gagal dibuat."));
    } finally {
      setActionKey(null);
    }
  }

  async function handleAssign(laborer: User, foremanId: number) {
    if (!foremanId) {
      setError("Pilih mandor terlebih dahulu.");
      return;
    }

    if (laborer.foremanId === foremanId) {
      setFeedback(`${laborer.username} sudah berada di bawah mandor tersebut.`);
      return;
    }

    setActionKey(`assign-${laborer.id}`);
    setError(null);
    setFeedback(null);

    try {
      const updatedUser = await assignForeman(laborer.id, foremanId);
      const foremanName = userById.get(foremanId)?.username ?? "mandor";
      setFeedback(`${updatedUser.username} berhasil ditugaskan ke ${foremanName}.`);
      await loadUsers(updatedUser.id);
    } catch (caughtError) {
      setError(readError(caughtError, "Assignment gagal."));
    } finally {
      setActionKey(null);
    }
  }

  async function handleUnassign(laborer: User) {
    if (laborer.foremanId === null) {
      setError(`${laborer.username} belum memiliki mandor.`);
      return;
    }

    setActionKey(`unassign-${laborer.id}`);
    setError(null);
    setFeedback(null);

    try {
      const updatedUser = await unassignForeman(laborer.id);
      setFeedback(`Assignment ${updatedUser.username} berhasil dicopot.`);
      await loadUsers(updatedUser.id);
    } catch (caughtError) {
      setError(readError(caughtError, "Unassignment gagal."));
    } finally {
      setActionKey(null);
    }
  }

  async function handleDelete(user: User) {
    if (user.username === session.username) {
      setError("Admin tidak dapat menghapus akun sendiri.");
      return;
    }

    const shouldDelete = window.confirm(
      `Hapus akun ${user.username}? Tindakan ini tidak dapat dibatalkan.`,
    );

    if (!shouldDelete) {
      return;
    }

    setActionKey(`delete-${user.id}`);
    setError(null);
    setFeedback(null);

    try {
      await deleteUser(user.id);
      setFeedback(`Pengguna ${user.username} berhasil dihapus.`);
      setSelectedUser((current) => (current?.id === user.id ? null : current));
      await loadUsers(selectedUser?.id === user.id ? undefined : selectedUser?.id);
    } catch (caughtError) {
      setError(readError(caughtError, "Pengguna gagal dihapus."));
    } finally {
      setActionKey(null);
    }
  }

  function handleExport() {
    const rows = [
      ["ID", "Nama", "Email", "Role", "Mandor", "Sertifikasi"],
      ...visibleUsers.map((user) => [
        formatUserCode(user),
        user.username,
        user.email,
        roleLabels[user.role],
        user.foremanId
          ? userById.get(user.foremanId)?.username ?? String(user.foremanId)
          : "",
        user.foremanCertificationNumber ?? "",
      ]),
    ];

    const csv = rows
      .map((row) => row.map((value) => csvValue(value)).join(","))
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "mysawit-users.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function renderRoleBadge(userRole: Role) {
    return (
      <Badge variant={userRole === "ADMIN" ? "default" : "muted"}>
        {roleLabels[userRole]}
      </Badge>
    );
  }

  function renderCreateUserDialog() {
    return (
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
          <Button type="button">
            <UserPlus className="size-4" />
            Tambah Pengguna
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna</DialogTitle>
            <DialogDescription>
              Buat akun untuk buruh, mandor, atau sopir.
            </DialogDescription>
          </DialogHeader>

          <form className="grid gap-4" onSubmit={handleCreateUser}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-[#44483e]">Nama</span>
                <Input
                  required
                  value={createForm.username}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                  placeholder="Nama pengguna"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-[#44483e]">Email</span>
                <Input
                  required
                  type="email"
                  value={createForm.email}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="email@mysawit.co"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-[#44483e]">
                  Password Awal
                </span>
                <Input
                  required
                  minLength={8}
                  type="password"
                  value={createForm.password}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Minimal 8 karakter"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-[#44483e]">Role</span>
                <Select
                  value={createForm.role}
                  onValueChange={(value) =>
                    setCreateForm((current) => ({
                      ...current,
                      role: value as Role,
                    }))
                  }
                >
                  <SelectTrigger className="h-12 w-full px-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selfRegistrationRoleOptions.map((item) => (
                      <SelectItem key={item} value={item}>
                        {roleLabels[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-semibold text-[#44483e]">
                  Nomor Sertifikasi Mandor
                </span>
                <Input
                  required={createForm.role === "FOREMAN"}
                  disabled={createForm.role !== "FOREMAN"}
                  value={createForm.foremanCertificationNumber}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      foremanCertificationNumber: event.target.value,
                    }))
                  }
                  placeholder="Wajib untuk role mandor"
                />
              </label>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Batal
                </Button>
              </DialogClose>
              <Button type="submit" disabled={actionKey === "create-user"}>
                <UserPlus className="size-4" />
                {actionKey === "create-user" ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  function renderListView() {
    return (
      <div className="space-y-5">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-[rgba(116,121,109,0.22)] bg-white px-4 py-3">
            <p className="mono-label text-[#74796d]">Total Pengguna</p>
            <p className="mt-2 text-2xl font-bold text-[#1a1c18]">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-[rgba(116,121,109,0.22)] bg-white px-4 py-3">
            <p className="mono-label text-[#74796d]">Mandor</p>
            <p className="mt-2 text-2xl font-bold text-[#1a1c18]">
              {stats.foremen}
            </p>
          </div>
          <div className="rounded-lg border border-[rgba(116,121,109,0.22)] bg-white px-4 py-3">
            <p className="mono-label text-[#74796d]">Buruh</p>
            <p className="mt-2 text-2xl font-bold text-[#1a1c18]">
              {stats.laborers}
            </p>
          </div>
          <div className="rounded-lg border border-[rgba(116,121,109,0.22)] bg-white px-4 py-3">
            <p className="mono-label text-[#74796d]">Belum Ditugaskan</p>
            <p className="mt-2 text-2xl font-bold text-[#1a1c18]">
              {stats.unassignedLaborers}
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-white shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
          <div className="flex flex-col gap-4 border-b border-[rgba(116,121,109,0.18)] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#74796d]" />
              <span className="sr-only">Cari pengguna</span>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama, email, atau ID..."
                className="pl-11"
              />
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                onClick={() => void loadUsers()}
                disabled={isLoading}
              >
                <RefreshCcw className="size-4" />
                Refresh
              </Button>
              {renderCreateUserDialog()}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-b border-[rgba(116,121,109,0.18)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Select value={role} onValueChange={(value) => setRole(value as Role | "ALL")}>
              <SelectTrigger className="h-11 w-full px-4 sm:w-56">
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
            <Button
              type="button"
              variant="secondary"
              onClick={handleExport}
              disabled={visibleUsers.length === 0}
            >
              <Download className="size-4" />
              Export
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[54rem] text-left text-sm">
              <thead className="bg-[#efeee7] text-xs font-semibold uppercase tracking-[0.01em] text-[#44483e]">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Kontak</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(116,121,109,0.16)]">
                {visibleUsers.map((user) => (
                  <tr
                    key={user.id}
                    tabIndex={0}
                    className="cursor-pointer align-middle transition hover:bg-[#fffee1]/45 focus:bg-[#fffee1]/60 focus:outline-none"
                    onClick={() => void handleViewDetails(user.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        void handleViewDetails(user.id);
                      }
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#cdedae] text-sm font-bold text-[#2b4316]">
                          {user.username.slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#1a1c18]">
                            {user.username}
                          </p>
                          <p className="mt-1 text-xs text-[#74796d]">
                            {formatUserCode(user)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-[#44483e]">
                        <Mail className="size-4 shrink-0 text-[#74796d]" />
                        <span className="break-all">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{renderRoleBadge(user.role)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-[#1a1c18]">
                        <span className="size-2 rounded-full bg-[#2b4316]" />
                        Aktif
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          title="Hapus pengguna"
                          aria-label="Hapus pengguna"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleDelete(user);
                          }}
                          disabled={
                            user.username === session.username ||
                            actionKey === `delete-${user.id}`
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-[rgba(116,121,109,0.18)] px-4 py-4 text-sm text-[#44483e]">
            <span>
              Menampilkan {visibleUsers.length} dari {users.length} pengguna
            </span>
            {isDetailLoading || isLoading ? (
              <span className="font-medium text-[#74796d]">Memuat...</span>
            ) : null}
          </div>

          {!isLoading && visibleUsers.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-[#74796d]">
              Tidak ada pengguna yang cocok dengan filter saat ini.
            </div>
          ) : null}
        </section>
      </div>
    );
  }

  function renderProfileDetails(user: User) {
    const foreman = user.foremanId ? userById.get(user.foremanId) : null;
    const assignedLaborers = users.filter((item) => item.foremanId === user.id);

    return (
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4 border-t border-[rgba(116,121,109,0.16)] pt-3">
          <dt className="text-[#74796d]">Role</dt>
          <dd>{renderRoleBadge(user.role)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-[#74796d]">Email</dt>
          <dd className="break-all text-right font-medium text-[#1a1c18]">
            {user.email}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-[#74796d]">Status</dt>
          <dd className="font-medium text-[#1a1c18]">Aktif</dd>
        </div>
        {user.role === "FOREMAN" ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#74796d]">Sertifikasi</dt>
              <dd className="text-right font-medium text-[#1a1c18]">
                {user.foremanCertificationNumber ?? "Belum diisi"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#74796d]">Buruh Ditugaskan</dt>
              <dd className="font-medium text-[#1a1c18]">
                {assignedLaborers.length}
              </dd>
            </div>
          </>
        ) : null}
        {user.role === "LABORER" ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[#74796d]">Mandor</dt>
            <dd className="text-right font-medium text-[#1a1c18]">
              {foreman ? foreman.username : "Belum ditugaskan"}
            </dd>
          </div>
        ) : null}
      </dl>
    );
  }

  function renderLaborerAssignment(user: User) {
    const foreman = user.foremanId ? userById.get(user.foremanId) : null;
    const query = foremanSearch.trim().toLowerCase();
    const visibleForemen = foremen.filter((foremanOption) => {
      if (!query) {
        return true;
      }

      return (
        foremanOption.username.toLowerCase().includes(query) ||
        foremanOption.email.toLowerCase().includes(query) ||
        formatUserCode(foremanOption).toLowerCase().includes(query)
      );
    });

    return (
      <section className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#2b4316]" />
              <h2 className="font-[var(--font-syne)] text-lg font-bold text-[#1a1c18]">
                Assignment Mandor
              </h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#74796d]">
              Pilih mandor dari daftar untuk menempatkan atau memindahkan buruh.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => void handleUnassign(user)}
            disabled={
              user.foremanId === null || actionKey === `unassign-${user.id}`
            }
          >
            <UserMinus className="size-4" />
            Copot
          </Button>
        </div>

        <div className="mt-5 rounded-lg border border-[rgba(116,121,109,0.18)] bg-[#fffee1]/35 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.01em] text-[#74796d]">
            Mandor Saat Ini
          </p>
          <p className="mt-1 font-semibold text-[#1a1c18]">
            {foreman ? foreman.username : "Belum ditugaskan"}
          </p>
        </div>

        <label className="relative mt-4 block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#74796d]" />
          <span className="sr-only">Cari mandor</span>
          <Input
            value={foremanSearch}
            onChange={(event) => setForemanSearch(event.target.value)}
            placeholder="Cari mandor berdasarkan nama, email, atau ID..."
            className="pl-11"
          />
        </label>

        <div className="mt-4 overflow-hidden rounded-lg border border-[rgba(116,121,109,0.18)]">
          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_8rem] gap-3 bg-[#efeee7] px-4 py-3 text-xs font-semibold uppercase tracking-[0.01em] text-[#44483e]">
            <span>Mandor</span>
            <span>Kontak</span>
            <span className="text-right">Aksi</span>
          </div>

          <div className="max-h-[26rem] overflow-y-auto">
            {visibleForemen.map((foremanOption) => {
              const isCurrent = foremanOption.id === user.foremanId;

              return (
                <article
                  key={foremanOption.id}
                  className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_8rem] gap-3 border-t border-[rgba(116,121,109,0.14)] px-4 py-3 transition hover:bg-[#fffee1]/45"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#cdedae] text-sm font-bold text-[#2b4316]">
                      {foremanOption.username.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#1a1c18]">
                        {foremanOption.username}
                      </p>
                      <p className="mt-1 text-xs text-[#74796d]">
                        {formatUserCode(foremanOption)}
                      </p>
                    </div>
                  </div>
                  <div className="min-w-0 text-sm text-[#44483e]">
                    <p className="truncate">{foremanOption.email}</p>
                    {isCurrent ? (
                      <Badge variant="default" className="mt-2">
                        Mandor saat ini
                      </Badge>
                    ) : (
                      <p className="mt-2 text-xs text-[#74796d]">Tersedia</p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant={isCurrent ? "secondary" : "primary"}
                      onClick={() => void handleAssign(user, foremanOption.id)}
                      disabled={
                        isCurrent ||
                        actionKey === `assign-${user.id}` ||
                        foremen.length === 0
                      }
                    >
                      <UserCheck className="size-4" />
                      {isCurrent ? "Saat ini" : user.foremanId ? "Pilih" : "Assign"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>

          {visibleForemen.length === 0 ? (
            <p className="border-t border-[rgba(116,121,109,0.14)] px-4 py-8 text-center text-sm text-[#74796d]">
              Tidak ada mandor yang cocok.
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  function renderDetailView(user: User) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="w-fit"
            onClick={() => setSelectedUser(null)}
          >
            <ArrowLeft className="size-4" />
            Kembali ke Daftar
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-fit text-[#ba1a1a] hover:bg-[#ffdad6] hover:text-[#93000a]"
            onClick={() => void handleDelete(user)}
            disabled={user.username === session.username || actionKey === `delete-${user.id}`}
          >
            <Trash2 className="size-4" />
            Hapus Pengguna
          </Button>
        </div>

        <section
          className={
            user.role === "LABORER"
              ? "grid gap-5 xl:grid-cols-[22rem_minmax(0,1fr)]"
              : "grid gap-5 xl:grid-cols-[22rem_minmax(0,1fr)]"
          }
        >
          <div className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
            <div className="flex flex-col items-center text-center">
              <span className="inline-flex size-20 items-center justify-center rounded-lg bg-[#cdedae] text-3xl font-bold text-[#2b4316]">
                {user.username.slice(0, 1).toUpperCase()}
              </span>
              <h2 className="mt-4 font-[var(--font-syne)] text-xl font-bold text-[#1a1c18]">
                {user.username}
              </h2>
              <Badge variant="outline" className="mt-3">
                ID: {formatUserCode(user)}
              </Badge>
            </div>
            {renderProfileDetails(user)}
          </div>

          {user.role === "LABORER" ? (
            renderLaborerAssignment(user)
          ) : (
            <div className="rounded-lg border border-[rgba(116,121,109,0.24)] bg-white p-5 shadow-[0_18px_44px_rgba(119,78,21,0.08)]">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-[#2b4316]" />
                <h2 className="font-[var(--font-syne)] text-lg font-bold text-[#1a1c18]">
                  Profil Pengguna
                </h2>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[rgba(116,121,109,0.18)] px-4 py-3">
                  <p className="mono-label text-[#74796d]">Akses</p>
                  <p className="mt-2 font-semibold text-[#1a1c18]">
                    {roleLabels[user.role]}
                  </p>
                </div>
                <div className="rounded-lg border border-[rgba(116,121,109,0.18)] px-4 py-3">
                  <p className="mono-label text-[#74796d]">Status Akun</p>
                  <p className="mt-2 font-semibold text-[#1a1c18]">Aktif</p>
                </div>
                {user.role === "FOREMAN" ? (
                  <div className="rounded-lg border border-[rgba(116,121,109,0.18)] px-4 py-3 sm:col-span-2">
                    <p className="mono-label text-[#74796d]">Sertifikasi</p>
                    <p className="mt-2 font-semibold text-[#1a1c18]">
                      {user.foremanCertificationNumber ?? "Belum diisi"}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {feedback ? (
        <p className="rounded-lg border border-[rgba(63,105,1,0.18)] bg-[rgba(205,237,174,0.55)] px-4 py-3 text-sm font-medium text-[#2b4316]">
          {feedback}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-[rgba(186,26,26,0.25)] bg-[rgba(186,26,26,0.06)] px-4 py-3 text-sm font-medium text-[#93000a]">
          {error}
        </p>
      ) : null}

      {selectedUser ? renderDetailView(selectedUser) : renderListView()}
    </div>
  );
}
