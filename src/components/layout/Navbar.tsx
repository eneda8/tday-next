"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  Home,
  BarChart3,
  PenTool,
  Search,
  LogOut,
  Settings,
  User,
} from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navLinks = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/charts", label: "Charts", icon: BarChart3 },
    { href: "/write", label: "Write", icon: PenTool },
    { href: "/posts/search", label: "Search", icon: Search },
  ];

  // Type-safe access to our custom session fields
  const user = session?.user as
    | {
        id?: string;
        username?: string;
        email?: string;
        isVerified?: boolean;
        avatar?: string;
      }
    | undefined;

  return (
    <nav className="sticky top-0 z-50 border-b border-cream-dark bg-cream shadow-card">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            href={session ? "/home" : "/"}
            className="text-2xl font-bold text-forest"
          >
            t&apos;day
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {session && (
              <>
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2 text-forest transition-colors hover:text-forest-light"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center gap-4">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 rounded-lg bg-cream-dark px-4 py-2 transition-colors hover:bg-cream-dark/80"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username || "User"}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-sm font-bold text-cream">
                      {(user?.username || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="hidden text-sm font-medium text-forest sm:inline">
                    {user?.username || "User"}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg bg-white shadow-card-hover">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-3 text-forest transition-colors hover:bg-cream-light"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-3 text-forest transition-colors hover:bg-cream-light"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut({ redirectTo: "/" });
                        setIsDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 border-t border-cream-dark px-4 py-3 text-left text-forest transition-colors hover:bg-cream-light"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden gap-2 md:flex">
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 text-forest transition-colors hover:text-forest-light"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-forest px-4 py-2 text-cream transition-colors hover:bg-forest-dark"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-forest" />
              ) : (
                <Menu className="h-6 w-6 text-forest" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="border-t border-cream-dark pb-4 pt-2">
            {session ? (
              <>
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2 px-0 py-3 text-forest transition-colors hover:text-forest-light"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Link>
                ))}
                <div className="mt-2 border-t border-cream-dark pt-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-0 py-3 text-forest transition-colors hover:text-forest-light"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-0 py-3 text-forest transition-colors hover:text-forest-light"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ redirectTo: "/" });
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-0 py-3 text-left text-forest transition-colors hover:text-forest-light"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 text-forest transition-colors hover:text-forest-light"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-forest px-4 py-2 text-center text-cream transition-colors hover:bg-forest-dark"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
