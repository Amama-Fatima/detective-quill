import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import AuthButtons from "./auth-buttons";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Logo/Brand */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="flex items-center space-x-2">
            <Search className="h-6 w-6 text-primary" />
            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Detective's Quill
            </span>
          </Link>
        </div>

        {/* Mobile Logo */}
        <div className="mr-6 flex md:hidden">
          <Link href="/" className="flex items-center space-x-2">
            <Search className="h-6 w-6 text-primary" />
            <span className="ml-2 text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Detective's Quill
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Dashboard
            </Link>
            <Link
              href="/cases"
              className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Cases
            </Link>
          </nav>

          <AuthButtons />
        </div>
      </div>
    </header>
  );
}
