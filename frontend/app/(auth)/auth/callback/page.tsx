"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/components/auth/AuthContext";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    localStorage.setItem("accessToken", token);

    const authenticate = async () => {
      await refreshUser();
      router.replace("/tasks");
    };

    authenticate();
  }, [searchParams, router, refreshUser]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-[var(--foreground-secondary)]">
        Signing you in...
      </p>
    </main>
  );
}