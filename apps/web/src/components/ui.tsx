import clsx from "clsx";

export function SeverityBadge({ severity }: { severity: string }) {
  return <span className={`badge-${severity}`}>{severity.toUpperCase()}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge-${status}`}>{status.replace("_", " ").toUpperCase()}</span>;
}

export function StatCard({
  label, value, sub, color = "accent"
}: { label: string; value: string | number; sub?: string; color?: string }) {
  const colorMap: Record<string, string> = {
    accent: "text-accent",
    danger: "text-danger",
    warning: "text-warning",
    success: "text-success",
    info: "text-info",
  };
  return (
    <div className="card">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={clsx("text-2xl font-bold", colorMap[color] || "text-white")}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <div className="text-gray-600 mb-3">{icon}</div>}
      <p className="text-gray-300 font-medium">{title}</p>
      {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function AssetTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    fake_ssh: "SSH",
    fake_http_admin: "Admin Panel",
    fake_database: "Database",
    honeytoken: "Honeytoken",
    fake_api: "API",
  };
  return (
    <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-300 border border-border font-mono">
      {labels[type] || type}
    </span>
  );
}

export function EventTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    ssh_login_attempt: "SSH Login",
    http_request: "HTTP Request",
    database_probe: "DB Probe",
    api_request: "API Request",
    honeytoken_trigger: "Token Trigger",
  };
  return (
    <span className="px-2 py-0.5 rounded text-xs bg-accent/10 text-accent border border-accent/20 font-mono">
      {map[type] || type}
    </span>
  );
}

import React from "react";
export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-base font-semibold text-white mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
// Project version: DeceptionGrid V1.3
