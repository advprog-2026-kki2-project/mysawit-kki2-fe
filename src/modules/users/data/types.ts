import type { Role } from "@/modules/auth/data/types";

export type User = {
  id: number;
  email: string;
  username: string;
  role: Role;
  foremanId: number | null;
  foremanCertificationNumber: string | null;
};

export type UserFilters = {
  role?: Role | "ALL";
  name?: string;
  email?: string;
};

export type CreateUserPayload = {
  email: string;
  username: string;
  password: string;
  role: Role;
  foremanCertificationNumber?: string;
};

export type CreateUserResult = {
  message: string;
  username: string;
  role: Role;
};
