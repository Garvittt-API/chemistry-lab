"use client";

import { Atom, BookOpen, Menu, Search, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { classNames } from "../lib/utils";
import { ThemeToggle } from "./theme-toggle";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore experiments" },
  { href: "/subjects", label: "Subjects" },
  { href: "/my-lab", label: "My Lab" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            <Atom size={22} strokeWidth={1.8} />
          </span>
          <span>
            <span className="brand-name">Virtual Chemistry Lab</span>
            <span className="brand-caption">Learn with clarity</span>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link
              className={classNames("nav-link", pathname === item.href && "nav-link-active")}
              href={item.href}
              key={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link
            className="icon-button"
            href="/explore"
            aria-label="Search experiments"
            title="Search experiments"
          >
            <Search size={19} />
          </Link>
          <Link
            className="icon-button header-settings"
            href="/settings"
            aria-label="Settings"
            title="Settings"
          >
            <Settings size={19} />
          </Link>
          <ThemeToggle />
          <button
            className="icon-button menu-button"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      <div className={classNames("mobile-nav-wrap", menuOpen && "mobile-nav-wrap-open")}>
        <nav id="mobile-navigation" className="container mobile-nav" aria-label="Mobile navigation">
          {navigation.map((item) => (
            <Link
              className={classNames(
                "mobile-nav-link",
                pathname === item.href && "mobile-nav-link-active",
              )}
              href={item.href}
              key={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link className="mobile-nav-link" href="/help" onClick={() => setMenuOpen(false)}>
            <BookOpen size={17} aria-hidden="true" />
            Help and guidance
          </Link>
        </nav>
      </div>
    </header>
  );
}
