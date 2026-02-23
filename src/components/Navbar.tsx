"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import RateModal from "@/components/RateModal";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // Desktop center nav links
  const navLinks = [
    { href: "/home", label: "Home", icon: "fas fa-home" },
    { href: "/charts", label: "Charts", icon: "fas fa-chart-bar" },
    { href: "/journal", label: "Journal", icon: "fas fa-book" },
  ];

  // Sidebar menu links
  const secondaryLinks = [
    { href: "/home", label: "Home", icon: "fas fa-home" },
    { href: "/charts", label: "Charts", icon: "fas fa-chart-bar" },
    { href: "/journal", label: "Journal", icon: "fas fa-book" },
    { href: "/bookmarks", label: "Bookmarks", icon: "fas fa-bookmark" },
    { href: "/search", label: "Search", icon: "fas fa-search" },
    { href: "/profile", label: "Profile", icon: "fas fa-user-circle" },
    { href: "/settings", label: "Settings", icon: "fas fa-cog" },
  ];

  const footerLinks = [
    { href: "/about", label: "About", icon: "fas fa-info-circle" },
    { href: "/terms", label: "Terms", icon: "fas fa-file-alt" },
    { href: "/privacy", label: "Privacy", icon: "fas fa-shield-alt" },
    { href: "/contact", label: "Contact", icon: "fas fa-envelope" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* ===== Top Navbar ===== */}
      <nav className="sticky top-0 z-40 border-b border-warm-border/40 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="-ml-2 rounded-lg p-2 text-warm-gray hover:bg-cream-dark/50 hover:text-warm-brown transition-colors"
              aria-label="Toggle menu"
            >
              <i
                className={
                  "fas " +
                  (sidebarOpen ? "fa-times" : "fa-bars") +
                  " text-sm"
                }
              />
            </button>
            <Link
              href="/home"
              className="font-logo text-2xl text-gold hover:text-gold-hover"
            >
              t&apos;day
            </Link>
          </div>

          {/* Center: nav links (desktop) */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors " +
                  (isActive(link.href)
                    ? "bg-forest/10 text-forest"
                    : "text-warm-gray hover:bg-cream-dark/50 hover:text-warm-brown")
                }
              >
                <i className={link.icon + " text-xs"} />
                {link.label}
              </Link>
            ))}

            {/* Rate button (opens modal) */}
            <button
              onClick={() => setShowRateModal(true)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-warm-gray hover:bg-cream-dark/50 hover:text-warm-brown transition-colors"
            >
              <i className="fas fa-star text-xs" />
              Rate
            </button>

            {/* Write button — quick journal access from anywhere */}
            <Link
              href="/write"
              className={
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors " +
                (isActive("/write")
                  ? "bg-forest/10 text-forest"
                  : "text-warm-gray hover:bg-cream-dark/50 hover:text-warm-brown")
              }
            >
              <i className="fas fa-pen-to-square text-xs" />
              Write
            </Link>
          </div>

          {/* Right: Search icon + user dropdown */}
          <div className="flex items-center gap-1">
            {/* Search icon */}
            <Link
              href="/search"
              className="rounded-lg p-2 text-warm-gray hover:bg-cream-dark/50 hover:text-warm-brown transition-colors"
              title="Search"
            >
              <i className="fas fa-search text-sm" />
            </Link>

            {/* User dropdown */}
            <div className="relative ml-1">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-warm-brown transition-colors hover:bg-cream-dark/50"
              >
                <div className="h-7 w-7 overflow-hidden rounded-full bg-cream-dark">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-warm-gray">
                      <i className="fas fa-user" />
                    </div>
                  )}
                </div>
                <span className="hidden max-w-[100px] truncate font-medium sm:inline">
                  {session?.user?.name || "User"}
                </span>
                <i
                  className={
                    "fas fa-chevron-down text-[10px] text-warm-gray transition-transform " +
                    (dropdownOpen ? "rotate-180" : "")
                  }
                />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-1 w-44 rounded-lg border border-warm-border/40 bg-white py-1 shadow-lg">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-warm-brown hover:bg-cream-light"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <i className="fas fa-user-circle text-warm-gray" />{" "}
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-warm-brown hover:bg-cream-light"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <i className="fas fa-cog text-warm-gray" /> Settings
                    </Link>
                    <hr className="my-1 border-warm-border/30" />
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                      <i className="fas fa-sign-out-alt" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ===== Sidebar overlay (blurred background) ===== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== Sidebar (overlay, slides over content) ===== */}
      <aside
        className={
          "fixed left-0 top-14 z-30 flex h-[calc(100vh-3.5rem)] w-64 flex-col border-r border-warm-border/40 bg-white shadow-lg transition-transform duration-200 ease-in-out " +
          (sidebarOpen ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {/* Mobile-only main nav */}
          <div className="mb-4 md:hidden">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-warm-gray">
              Navigate
            </p>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
                  (isActive(link.href)
                    ? "bg-forest/10 text-forest"
                    : "text-warm-brown hover:bg-cream-light")
                }
              >
                <i className={link.icon + " w-4 text-center text-xs"} />
                {link.label}
              </Link>
            ))}

            {/* Rate button in mobile sidebar */}
            <button
              onClick={() => {
                setShowRateModal(true);
                setSidebarOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-warm-brown hover:bg-cream-light transition-colors"
            >
              <i className="fas fa-star w-4 text-center text-xs" />
              Rate
            </button>
          </div>

          {/* Secondary links */}
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-warm-gray">
            Menu
          </p>
          {secondaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
                (isActive(link.href)
                  ? "bg-forest/10 text-forest"
                  : "text-warm-brown hover:bg-cream-light")
              }
            >
              <i
                className={
                  link.icon + " w-4 text-center text-xs text-warm-gray"
                }
              />
              {link.label}
            </Link>
          ))}

          <hr className="my-3 border-warm-border/30" />

          {/* Footer links */}
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-warm-gray transition-colors hover:bg-cream-light hover:text-warm-brown"
            >
              <i className={link.icon + " w-4 text-center text-xs"} />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Sidebar footer */}
        <div className="border-t border-warm-border/30 p-3">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
          >
            <i className="fas fa-sign-out-alt w-4 text-center text-xs" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ===== Rate Modal ===== */}
      {showRateModal && (
        <RateModal onClose={() => setShowRateModal(false)} />
      )}
    </>
  );
}
