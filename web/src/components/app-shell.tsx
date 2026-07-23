"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { Home, NotebookPen, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { hasOnboarded } from "@/lib/storage";
import { Icon } from "@/components/icon";
import { useHydrated } from "@/lib/use-hydrated";
import { CloudDataGate } from "@/components/cloud-data-gate";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  accent?: boolean;
};

const navItems: NavItem[] = [
  { href: "/", label: "Start", icon: Home },
  { href: "/remember", label: "Merken", icon: NotebookPen, accent: true },
  { href: "/people", label: "Menschen", icon: Users },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isWelcomeRoute = pathname === "/welcome";
  const hydrated = useHydrated();
  const canRender = isWelcomeRoute || (hydrated && hasOnboarded());

  useEffect(() => {
    if (hydrated && !canRender) {
      router.replace("/welcome");
    }
  }, [canRender, hydrated, router]);

  if (!canRender && !isWelcomeRoute) {
    return null;
  }

  const content = (
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

  return isWelcomeRoute ? content : <CloudDataGate>{content}</CloudDataGate>;
}
