"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Pencil,
} from "lucide-react";

import {
  useAuth,
} from "../Auth/AuthContext";

type ProfileDetails = {
  name: string;
  email: string;
  title: string;
  username: string;
};

const getGuestProfileKey = (
  userId: string,
) => `guest-profile-${userId}`;

export default function ProfilePage() {
  const {
    user,
    loading,
    logout,
  } = useAuth();

  const [
    details,
    setDetails,
  ] = useState<ProfileDetails>({
    name: "",
    email: "",
    title: "Designer",
    username: "",
  });

  const [
    savedDetails,
    setSavedDetails,
  ] = useState<ProfileDetails>({
    name: "",
    email: "",
    title: "Designer",
    username: "",
  });

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    saveError,
    setSaveError,
  ] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    const isGuest =
      user.isGuest === true;

    const defaultDetails: ProfileDetails = {
      name: user.name ?? "",
      email: user.email ?? "",
      title: user.title ?? "",
      username: user.username ?? "",
    };
    if (isGuest) {
      const storedProfile =
        localStorage.getItem(
          getGuestProfileKey(
            user.id,
          ),
        );

      if (storedProfile) {
        try {
          const parsedProfile =
            JSON.parse(
              storedProfile,
            ) as ProfileDetails;

          setDetails(
            parsedProfile,
          );

          setSavedDetails(
            parsedProfile,
          );

          return;
        } catch {
          localStorage.removeItem(
            getGuestProfileKey(
              user.id,
            ),
          );
        }
      }
    }

    setDetails(
      defaultDetails,
    );

    setSavedDetails(
      defaultDetails,
    );
  }, [
    user,
  ]);

  if (loading) {
    return (
      <main className="min-h-full border-l border-[var(--border)] bg-[var(--background)]">
        <div className="flex min-h-[100dvh] items-center justify-center">
          <p className="text-sm text-[var(--foreground-secondary)]">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const isGuest =
    user.isGuest === true;

  const hasPendingChanges =
    details.name !==
    savedDetails.name ||
    details.email !==
    savedDetails.email ||
    details.title !==
    savedDetails.title ||
    details.username !==
    savedDetails.username;

  const updateDetail = (
    field: keyof ProfileDetails,
    value: string,
  ) => {
    setSaveError("");

    setDetails(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );
  };

  const discardChanges = () => {
    setDetails(
      savedDetails,
    );

    setSaveError("");
  };

  const saveChanges =
    async () => {
      if (
        !hasPendingChanges ||
        isSaving
      ) {
        return;
      }

      try {
        setIsSaving(true);

        setSaveError("");

        if (isGuest) {
          localStorage.setItem(
            getGuestProfileKey(
              user.id,
            ),
            JSON.stringify(
              details,
            ),
          );

          setSavedDetails(
            details,
          );

          return;
        }

        const response =
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                name: details.name.trim(),
                email: details.email.trim(),
                title: details.title.trim() || undefined,
                username:
                  details.username.trim() || undefined,
              }),
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
            "Failed to save profile",
          );
        }

        const updatedDetails: ProfileDetails = {
          name: data.name ?? details.name,
          email: data.email ?? details.email,
          title: data.title ?? details.title,
          username:
            data.username ??
            details.username,
        };



        setDetails(
          updatedDetails,
        );

        setSavedDetails(
          updatedDetails,
        );
      } catch (error) {
        setSaveError(
          error instanceof Error
            ? error.message
            : "Failed to save changes",
        );
      } finally {
        setIsSaving(false);
      }
    };

  return (
    <main className="min-h-[100dvh] border-l border-[var(--border)] bg-[var(--background)]">
      <div
        className={`flex min-h-full w-full items-start justify-center px-4 py-8 sm:px-6 md:items-center lg:px-8 ${hasPendingChanges ? "pb-28" : ""
          }`}
      >
        <div className="w-full max-w-[640px]">
          <div className="flex h-8 items-center px-0">
            <h1 className="text-2xl font-medium leading-none text-[var(--foreground)]">
              Profile
            </h1>
          </div>

          <section className="mt-10 w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex min-h-[76px] items-center justify-between border-b border-[var(--border)] px-7">
              <span className="text-sm font-normal text-[var(--foreground)]">
                Profile picture
              </span>

              <div className="h-[34px] w-[34px] overflow-hidden rounded-full border border-[var(--border)]">
                <img
                  src={
                    user.avatar ||
                    "/default-avatar.jpeg"
                  }
                  alt={
                    details.name ||
                    "User"
                  }
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="flex min-h-[86px] items-center justify-between gap-6 border-b border-[var(--border)] px-7">
              <span className="shrink-0 text-sm font-normal text-[var(--foreground)]">
                Email
              </span>

              <div className="flex w-full max-w-[260px] items-center gap-2">
                <input
                  type="email"
                  value={
                    details.email
                  }
                  disabled={
                    isGuest
                  }
                  onChange={(
                    event,
                  ) =>
                    updateDetail(
                      "email",
                      event.target.value,
                    )
                  }
                  placeholder={
                    isGuest
                      ? "Guest account"
                      : "Email"
                  }
                  className="h-9 min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface-secondary)] px-3 text-sm text-[var(--foreground)] outline-none transition-shadow focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[var(--accent-color)]">
                  <Pencil
                    size={13}
                    strokeWidth={2}
                  />
                </div>
              </div>
            </div>

            <div className="flex min-h-[72px] items-center justify-between gap-6 border-b border-[var(--border)] px-7">
              <span className="shrink-0 text-sm font-normal text-[var(--foreground)]">
                Full name
              </span>

              <input
                type="text"
                value={
                  details.name
                }
                onChange={(
                  event,
                ) =>
                  updateDetail(
                    "name",
                    event.target.value,
                  )
                }
                className="h-9 w-full max-w-[180px] rounded-md border border-[var(--border)] bg-[var(--surface-secondary)] px-3 text-sm text-[var(--foreground)] outline-none transition-shadow focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/20"
              />
            </div>

            <div className="flex min-h-[96px] items-center justify-between gap-6 border-b border-[var(--border)] px-7">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-normal text-[var(--foreground)]">
                  Title
                </span>

                <span className="text-xs leading-4 text-[var(--foreground-secondary)]">
                  Your job title or role
                </span>
              </div>

              <input
                type="text"
                value={
                  details.title
                }
                onChange={(
                  event,
                ) =>
                  updateDetail(
                    "title",
                    event.target.value,
                  )
                }
                className="h-9 w-full max-w-[180px] rounded-md border border-[var(--border)] bg-[var(--surface-secondary)] px-3 text-sm text-[var(--foreground)] outline-none transition-shadow focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/20"
              />
            </div>

            <div className="flex min-h-[96px] items-center justify-between gap-6 px-7">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-normal text-[var(--foreground)]">
                  Username
                </span>

                <span className="text-xs leading-4 text-[var(--foreground-secondary)]">
                  One word, like a nickname or first name
                </span>
              </div>

              <input
                type="text"
                value={
                  details.username
                }
                onChange={(
                  event,
                ) =>
                  updateDetail(
                    "username",
                    event.target.value,
                  )
                }
                className="h-9 w-full max-w-[180px] rounded-md border border-[var(--border)] bg-[var(--surface-secondary)] px-3 text-sm text-[var(--foreground)] outline-none transition-shadow focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/20"
              />
            </div>
          </section>

          <div className="mt-14">
            <h2 className="px-0 text-base font-medium leading-6 text-[var(--foreground)]">
              Workspace access
            </h2>

            <section className="mt-7 flex min-h-[82px] w-full items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-7 shadow-[0px_1px_1px_0px_#0000000A,0px_3px_6px_-2px_#00000005,0px_0px_0px_0.5px_#00000016]">
              <span className="text-xs font-medium leading-4 text-[var(--foreground)]">
                Remove yourself from the workspace
              </span>

              <button
                type="button"
                className="h-8 shrink-0 rounded-md bg-[var(--accent-color)] px-3 text-xs font-medium leading-4 text-[var(--accent-foreground)] transition-opacity hover:opacity-90"
                onClick={
                  logout
                }
              >
                Leave Workspace
              </button>
            </section>
          </div>
        </div>
      </div>

      {hasPendingChanges && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-lg sm:flex-row sm:items-center sm:justify-end sm:px-8">
          <div className="w-full sm:mr-auto sm:w-auto">
            <span className="text-sm text-[var(--foreground-secondary)]">
              You have unsaved changes
            </span>

            {saveError && (
              <p className="mt-1 text-xs text-red-500">
                {saveError}
              </p>
            )}
          </div>
          <div className="flex w-full justify-end gap-3 sm:w-auto">
            <button
              type="button"
              onClick={discardChanges}
              disabled={isSaving}
              className="flex-1 rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-secondary)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              Discard
            </button>

            <button
              type="button"
              onClick={saveChanges}
              disabled={isSaving}
              className="flex-1 rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}