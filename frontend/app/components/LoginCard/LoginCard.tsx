"use client";

import React from "react";

const GoogleIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M21.805 10.023H12v4.013h5.637c-.59 2.04-2.913 3.89-5.637 3.89a5.926 5.926 0 1 1 0-11.852c1.47 0 2.81.527 3.855 1.4l2.988-2.987A9.937 9.937 0 0 0 12 2.073a9.927 9.927 0 1 0 0 19.854c8.18 0 9.673-7.615 9.673-9.673 0-.65.066-1.1.132-1.73Z"
            fill="currentColor"
        />
    </svg>
);

export default function LoginCard() {
    const handleGoogleLogin = () => {
        window.location.href =
            'http://localhost:3001/auth/google';
    };

    const handleGuestLogin = async () => {
        const response = await fetch(
            "http://localhost:3001/auth/guest",
            {
                method: "POST",
            },
        );

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        localStorage.setItem(
            "accessToken",
            data.accessToken,
        );

        window.location.href = "/tasks";
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-4 py-8 sm:px-6">
            <div className="flex w-full max-w-[1200px] flex-col items-center">
                <div className="flex h-6 items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#171717]">
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 3.5 4.5 17.8l7.5 2.7 7.5-2.7L12 3.5Z"
                                stroke="white"
                                strokeWidth="1.7"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M12 3.5v17M7.2 15.9 12 20.5l4.8-4.6"
                                stroke="white"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <span className="text-[14px] font-semibold leading-none text-[#0A0A0A]">
                        Pyramid
                    </span>
                </div>

                <div className="mt-[56px] flex w-full flex-col items-center">
                    <section className="w-full max-w-[384px] rounded-[24px] border border-[#E5E5E5] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                        <div className="flex flex-col gap-[6px] text-center">
                            <h1 className="text-xl font-semibold leading-[20px] tracking-normal text-[#0A0A0A]">
                                Let&apos;s get back on track
                            </h1>

                            <p className="text-sm font-normal leading-5 text-[#737373]">
                                Enter your email below to login to your account.
                            </p>
                        </div>

                        <div className="mt-6 flex flex-col gap-3">
                            <button
                                type="button"
                                className="flex h-9 w-full items-center justify-center rounded-full bg-[#171717] px-3 py-2 text-sm font-medium leading-5 text-[#FAFAFA] transition-colors hover:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#171717] focus:ring-offset-2"
                                onClick={handleGuestLogin}
                            >
                                Continue as Guest
                            </button>

                            <button
                                type="button"
                                className="flex h-9 w-full items-center justify-center gap-[6px] rounded-full border border-[#E5E5E5] bg-white px-3 py-2 text-sm font-medium leading-5 text-[#0A0A0A] transition-colors hover:bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#E5E5E5] focus:ring-offset-2"
                                onClick={handleGoogleLogin}
                            >
                                <span className="flex h-4 w-4 items-center justify-center">
                                    <GoogleIcon />
                                </span>

                                <span>Login with Google</span>
                            </button>
                        </div>
                    </section>

                    <div className="mt-10 flex w-full max-w-[384px] justify-center px-4">
                        <p className="max-w-[208px] text-center text-xs font-normal leading-4 text-[#737373]">
                            By clicking continue, you agree to
                            <br />
                            our{" "}
                            <a
                                href="/terms"
                                className="underline hover:text-[#0A0A0A]"
                            >
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a
                                href="/privacy"
                                className="underline hover:text-[#0A0A0A]"
                            >
                                Privacy
                            </a>
                            <br />
                            <a
                                href="/privacy"
                                className="underline hover:text-[#0A0A0A]"
                            >
                                Policy
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}