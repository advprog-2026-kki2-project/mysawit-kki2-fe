export const roleOptions = ["LABORER", "FOREMAN", "DRIVER", "ADMIN"] as const;

export type Role = (typeof roleOptions)[number];

export const selfRegistrationRoleOptions = [
  "LABORER",
  "FOREMAN",
  "DRIVER",
] as const satisfies readonly Role[];

export const roleLabels: Record<Role, string> = {
  LABORER: "Pekerja",
  FOREMAN: "Mandor",
  DRIVER: "Sopir",
  ADMIN: "Admin",
};

export type AuthResponse = {
  message: string;
  username: string;
  role: Role;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  username: string;
  password: string;
  role: Role;
};
