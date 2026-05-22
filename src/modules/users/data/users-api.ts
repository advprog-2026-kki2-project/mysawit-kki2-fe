import { requestEmpty, requestJson } from "@/lib/api-client";
import type {
  CreateUserPayload,
  CreateUserResult,
  User,
  UserFilters,
} from "@/modules/users/data/types";

function buildUserQuery(filters?: UserFilters) {
  const params = new URLSearchParams();

  if (filters?.role && filters.role !== "ALL") {
    params.set("role", filters.role);
  }

  if (filters?.name?.trim()) {
    params.set("name", filters.name.trim());
  }

  if (filters?.email?.trim()) {
    params.set("email", filters.email.trim());
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function getUsers(filters?: UserFilters) {
  return requestJson<User[]>(`/api/users${buildUserQuery(filters)}`, {
    method: "GET",
  });
}

export function getUser(userId: number) {
  return requestJson<User>(`/api/users/${userId}`, {
    method: "GET",
  });
}

export function createUser(payload: CreateUserPayload) {
  return requestJson<CreateUserResult>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function assignForeman(laborerId: number, foremanId: number) {
  return requestJson<User>(`/api/users/${laborerId}/foreman`, {
    method: "PUT",
    body: JSON.stringify({ foremanId }),
  });
}

export function unassignForeman(laborerId: number) {
  return requestJson<User>(`/api/users/${laborerId}/foreman`, {
    method: "DELETE",
  });
}

export function deleteUser(userId: number) {
  return requestEmpty(`/api/users/${userId}`, {
    method: "DELETE",
  });
}
