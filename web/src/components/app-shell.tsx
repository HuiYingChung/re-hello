"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { Home, NotebookPen, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { hasOnboarded } from "@/lib/storage";
import { Icon } from "@/components/icon";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  accent?: boolean;
};

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/remember", label: "Remember", icon: NotebookPen, accent: true },
  { href: "/people", label: "People", icon: Users },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isWelcomeRoute = pathname === "/welcome";
  const [canRender, setCanRender] = useState(isWelcomeRoute);

  useEffect(() => {
    if (isWelcomeRoute) {
      setCanRender(true);
      return;
    }

    if (!hasOnboarded()) {
      setCanRender(false);
      router.replace("/welcome");
      return;
    }

    setCanRender(true);
  }, [isWelcomeRoute, pathname, router]);

  if (!canRender && !isWelcomeRoute) {
    return null;
  }

  return (
    <div className="app-stage">
      <div className="phone-shell">
        <div className="phone-status">
          <div className="phone-notch" />
        </div>
        <div className="phone-scroll">
          <main className="screen-content">{children}</main>
        </div>
        <nav className="bottom-nav">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-pill ${isActive ? "nav-active" : ""} ${item.accent ? "nav-accent" : ""}`}
              >
                <span className="nav-icon-wrap">
                  <Icon as={item.icon} size={20} flat />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
