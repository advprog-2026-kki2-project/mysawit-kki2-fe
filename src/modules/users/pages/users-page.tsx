import type { Role } from "@/modules/auth/data/types";
import { ProtectedRoute } from "@/modules/dashboard/components/protected-route";
import { UserManagementPanel } from "@/modules/users/components/user-management-panel";

const allowedRoles = ["ADMIN"] as const satisfies readonly Role[];

export function UsersPage() {
  return (
    <ProtectedRoute
      allowedRoles={allowedRoles}
      title="Manajemen Pengguna"
      description="Kelola akun, filter pengguna, assignment buruh ke mandor, dan penghapusan akun."
    >
      <UserManagementPanel />
    </ProtectedRoute>
  );
}
