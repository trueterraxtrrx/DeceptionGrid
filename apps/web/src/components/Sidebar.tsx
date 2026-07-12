import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Shield, Zap, BellRing, Key,
  ScrollText, Settings, LogOut, Grid3x3
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import clsx from "clsx";

const nav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/assets", icon: Shield, label: "Deception Assets" },
  { to: "/events", icon: Zap, label: "Events" },
  { to: "/alerts", icon: BellRing, label: "Alerts" },
  { to: "/honeytokens", icon: Key, label: "Honeytokens" },
  { to: "/audit", icon: ScrollText, label: "Audit Logs" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 shrink-0 h-screen flex flex-col bg-surface border-r border-border">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Grid3x3 size={20} className="text-accent" />
          <span className="font-bold text-white tracking-tight">DeceptionGrid</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-0.5 ml-7">by KRYNEX Labs</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname.startsWith(to)
                ? "bg-accent/10 text-accent"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3">
          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
            {user?.full_name?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.full_name}</p>
            <p className="text-[10px] text-gray-500 truncate">{user?.role}</p>
          </div>
          <button onClick={logout} className="text-gray-500 hover:text-red-400 transition-colors">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
// Project version: DeceptionGrid V1.6


