"use client";

import { useEffect, useState } from "react";

import { ApiError, getSession } from "@/modules/auth/data/auth-api";
import type { AuthResponse } from "@/modules/auth/data/types";

export function useAuthSession() {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refreshSession() {
    setIsLoading(true);
    setError(null);

    try {
      const activeSession = await getSession();
      setSession(activeSession);
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        setSession(null);
      } else if (caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError("Status sesi tidak dapat dimuat.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function loadInitialSession() {
      setIsLoading(true);
      setError(null);

      try {
        const activeSession = await getSession();
        setSession(activeSession);
      } catch (caughtError) {
        if (caughtError instanceof ApiError && caughtError.status === 401) {
          setSession(null);
        } else if (caughtError instanceof Error) {
          setError(caughtError.message);
        } else {
          setError("Status sesi tidak dapat dimuat.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadInitialSession();
  }, []);

  return {
    session,
    isLoading,
    error,
    refreshSession,
  };
}
