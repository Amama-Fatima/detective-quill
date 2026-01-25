import React from "react";
import Link from "next/link";
import AuthButtons from "./auth-buttons";
import Image from "next/image";
import { getUserFromCookie } from "@/lib/utils/get-user";

export default async function Header() {
  const user = await getUserFromCookie();

  let loggedIn = false;

  if (user) {
    loggedIn = true;
  }

  return (
    <div className="sticky top-0 z-50 w-full p-4">
      <header className="mx-auto max-w-7xl rounded-2xl border border-border bg-chart-4 backdrop-blur supports-[backdrop-filter]:bg-chart-4/18 shadow-sm">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/quill-logo.png"
                alt="Detective's Quill Logo"
                width={140}
                height={130}
                className="text-primary background-transparent"
              />
              {/* <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Detective's Quill
              </span> */}
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="text-[1.1rem] font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            {loggedIn && (
              <Link
                href="/profile"
                className="text-[1.1rem] font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                Profile
              </Link>
            )}

            {loggedIn && (
              <Link
                href="/cases"
                className="text-[1.1rem] font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                Cases
              </Link>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center">
            <AuthButtons />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </header>
    </div>
  );
}

// Mobile Navigation Component
function MobileNav() {
  return (
    <div className="flex items-center space-x-4">
      <nav className="flex items-center space-x-4">
        <Link
          href="/"
          className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/cases"
          className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        >
          Cases
        </Link>
      </nav>
    </div>
  );
}
