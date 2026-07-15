import { useMutation, useQueryClient } from "@tanstack/react-query";
import { demoApi } from "@/api";
import { PageHeader } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { Terminal, Wifi, Database, Key } from "lucide-react";

const simulations = [
  { label: "SSH Login Attempt", icon: Terminal, fn: demoApi.simulateSsh, severity: "HIGH" },
  { label: "Admin Panel Hit", icon: Wifi, fn: demoApi.simulateAdmin, severity: "MEDIUM" },
  { label: "Database Probe", icon: Database, fn: demoApi.simulateDatabase, severity: "HIGH" },
  { label: "Honeytoken Trigger", icon: Key, fn: demoApi.simulateHoneytoken, severity: "CRITICAL" },
];

export function SettingsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const simMut = useMutation({
    mutationFn: (fn: () => Promise<any>) => fn(),
    onSuccess: () => qc.invalidateQueries(),
  });

  return (
    <div>
      <PageHeader title="Settings" subtitle="Organization & platform configuration" />

      {/* Org Info */}
      <div className="card mb-4">
        <p className="text-xs text-gray-500 mb-3 font-medium">ORGANIZATION</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs mb-1">Name</p>
            <p className="text-white">{user?.full_name}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Role</p>
            <span className="px-2 py-0.5 rounded text-xs bg-accent/10 text-accent border border-accent/20">
              {user?.role}
            </span>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Email</p>
            <p className="text-white font-mono text-xs">{user?.email}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Org ID</p>
            <p className="text-gray-500 font-mono text-xs truncate">{user?.organization_id}</p>
          </div>
        </div>
      </div>

      {/* Demo Simulator */}
      <div className="card">
        <p className="text-xs text-gray-500 mb-1 font-medium">SAFE DEMO SIMULATOR</p>
        <p className="text-xs text-gray-600 mb-4">
          Safely generate fake deception events and alerts without real network activity.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {simulations.map(({ label, icon: Icon, fn, severity }) => (
            <button
              key={label}
              onClick={() => simMut.mutate(fn)}
              disabled={simMut.isPending}
              className="flex items-center gap-3 p-3 bg-bg border border-border rounded-md hover:border-accent/40 transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Icon size={16} className="text-accent" />
              </div>
              <div>
                <p className="text-sm text-gray-200">{label}</p>
                <p className="text-xs text-gray-600">{severity}</p>
              </div>
            </button>
          ))}
        </div>
        {simMut.isSuccess && (
          <p className="text-xs text-success mt-3">Event generated - check Events & Alerts pages</p>
        )}
      </div>
    </div>
  );
}
// Project version: DeceptionGrid V1.6





