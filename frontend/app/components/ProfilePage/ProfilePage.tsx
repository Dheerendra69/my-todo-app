"use client";

import { Pencil } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function ProfilePage() {

  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen border-l border-[#E5E5E5] bg-white">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-[#737373]">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen border-l border-[#E5E5E5] bg-white">
      <div className="flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-[640px]">
          <div className="flex h-8 items-center px-0">
            <h1 className="text-2xl font-medium leading-none text-[#171717]">
              Profile
            </h1>
          </div>

          <section className="mt-10 w-full overflow-hidden rounded-lg border border-[#E5E5E5]">
            <div className="flex min-h-[76px] items-center justify-between border-b border-[#E5E5E5] px-7">
              <span className="text-sm font-normal text-[#171717]">
                Profile picture
              </span>

              <div className="h-[34px] w-[34px] overflow-hidden rounded-full border border-[#E5E5E5]">
                <img
                  src={user.avatar || "/default-avatar.jpeg"}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="flex min-h-[86px] items-center justify-between border-b border-[#E5E5E5] px-7">
              <span className="text-sm font-normal text-[#171717]">
                Email
              </span>

              <div className="flex items-center gap-3">
                <span className="text-sm text-[#171717]">
                  {user.email || "Guest account"}
                </span>

                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F5F5F5]"
                >
                  <Pencil size={13} strokeWidth={2} />
                </button>
              </div>
            </div>

            <div className="flex min-h-[72px] items-center justify-between border-b border-[#E5E5E5] px-7">
              <span className="text-sm font-normal text-[#171717]">
                Full name
              </span>

              <input
                type="text"
                defaultValue={user.name}
                className="h-9 w-full max-w-[180px] rounded-md border border-[#E5E5E5] bg-[#E5E5E5] px-3 text-sm text-[#737373] outline-none"
              />
            </div>

            <div className="flex min-h-[96px] items-center justify-between border-b border-[#E5E5E5] px-7">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-normal text-[#171717]">
                  Title
                </span>

                <span className="text-xs leading-4 text-[#171717]">
                  Your job title or role
                </span>
              </div>

              <input
                type="text"
                defaultValue="Designer"
                className="h-9 w-full max-w-[180px] rounded-md border border-[#E5E5E5] bg-[#E5E5E5] px-3 text-sm text-[#737373] outline-none"
              />
            </div>

            <div className="flex min-h-[96px] items-center justify-between px-7">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-normal text-[#171717]">
                  Username
                </span>

                <span className="text-xs leading-4 text-[#171717]">
                  One word, like a nickname or first name
                </span>
              </div>

              <input
                type="text"
                defaultValue="Dexuser"
                className="h-9 w-full max-w-[180px] rounded-md border border-[#E5E5E5] bg-[#E5E5E5] px-3 text-sm text-[#737373] outline-none"
              />
            </div>
          </section>

          <div className="mt-14">
            <h2 className="px-0 text-base font-medium leading-6 text-[#171717]">
              Workspace access
            </h2>

            <section className="mt-7 flex min-h-[82px] w-full items-center justify-between gap-3 rounded-lg border border-[#E5E5E5] px-7 shadow-[0px_1px_1px_0px_#0000000A,0px_3px_6px_-2px_#00000005,0px_0px_0px_0.5px_#00000016]">
              <span className="text-xs font-medium leading-4 text-[#171717]">
                Remove yourself from the workspace
              </span>

              <button
                type="button"
                className="h-8 shrink-0 rounded-md bg-[#DC26261A] px-3 text-xs font-medium leading-4 text-[#DC2626]"
                onClick={logout}
              >
                Leave Workspace
              </button>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}