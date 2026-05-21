import type { Role } from "@/modules/auth/data/types";

export type User = {
  id: number;
  email: string;
  username: string;
  role: Role;
  foremanId: number | null;
};

export type UserFilters = {
  role?: Role | "ALL";
  name?: string;
  email?: string;
};
