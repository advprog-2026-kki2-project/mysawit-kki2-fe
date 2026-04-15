export const roleOptions = ["LABORER", "FOREMAN", "DRIVER", "ADMIN"] as const;

export type Role = (typeof roleOptions)[number];

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
