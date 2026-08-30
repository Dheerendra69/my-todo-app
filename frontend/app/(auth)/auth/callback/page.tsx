"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/components/Auth/AuthContext";

function AuthCallbackContent() {
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
      try {
        await refreshUser();
        router.replace("/tasks");
      } catch (error) {
        console.error("Authentication failed:", error);
        localStorage.removeItem("accessToken");
        router.replace("/login");
      }
    };

    authenticate();
  }, [searchParams, router, refreshUser]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-foreground-secondary">
        Signing you in...
      </p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-foreground-secondary">
            Signing you in...
          </p>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}