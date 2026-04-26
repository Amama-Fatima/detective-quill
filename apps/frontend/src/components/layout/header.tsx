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
    <header className="fixed inset-x-0 top-0 z-100 border-b border-secondary-foreground/40 bg-background/70 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-17 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-12">
        <div className="relative h-14 w-45 overflow-hidden">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Detective's Quill Logo"
              fill
              sizes="180px"
              className="object-cover object-center"
            />
          </Link>
        </div>

        <nav className="hidden items-center gap-9 md:flex">
          {loggedIn && (
            <Link
              href="/profile"
              className="noir-text text-[1.1rem] text-muted-foreground transition-colors duration-200 hover:text-secondary-foreground"
            >
              Profile
            </Link>
          )}

          {loggedIn && (
            <Link
              href="/projects"
              className="noir-text text-[1.1rem] text-muted-foreground transition-colors duration-200 hover:text-secondary-foreground"
            >
              Projects
            </Link>
          )}
        </nav>

        <div className="flex items-center">
          <AuthButtons />
        </div>

        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

function MobileNav() {
  return (
    <div className="flex items-center space-x-4">
      <nav className="flex items-center space-x-4">
        <Link
          href="/profile"
          className="text-sm text-muted-foreground transition-colors duration-200 hover:text-secondary-foreground"
        >
          Profile
        </Link>

        <Link
          href="/projects"
          className="text-sm text-muted-foreground transition-colors duration-200 hover:text-secondary-foreground"
        >
          Projects
        </Link>
      </nav>
    </div>
  );
}
