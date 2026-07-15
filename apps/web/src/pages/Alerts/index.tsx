import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertsApi } from "@/api";
import { PageHeader, SeverityBadge, StatusBadge, LoadingSpinner, EmptyState } from "@/components/ui";
import { BellRing } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Alert } from "@/types";

const STATUSES = ["", "open", "investigating", "resolved", "false_positive"];
const SEVERITIES = ["", "low", "medium", "high", "critical"];

export function AlertsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("open");
  const [severity, setSeverity] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["alerts", status, severity],
    queryFn: () => alertsApi.list({ limit: 100, status: status || undefined, severity: severity || undefined }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, s }: { id: string; s: string }) => alertsApi.updateStatus(id, s),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const alerts: Alert[] = data?.items || [];

  return (
    <div>
      <PageHeader title="Alerts" subtitle={`${data?.total ?? 0} alerts`} />

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                status === s ? "bg-accent/20 text-accent border border-accent/40" : "btn-ghost"
              }`}
            >
              {s || "All Status"}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-4">
          {SEVERITIES.map((s) => (
            <button
              key={s}
              onClick={() => setSeverity(s)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                severity === s ? "bg-accent/20 text-accent border border-accent/40" : "btn-ghost"
              }`}
            >
              {s || "All Severity"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <LoadingSpinner /> : alerts.length === 0 ? (
        <EmptyState icon={<BellRing size={40} />} title="No alerts" description="No alerts match the current filters" />
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Title", "Severity", "Status", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {alerts.map((a) => (
                <tr key={a.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-gray-200 max-w-xs">
                    <p className="truncate">{a.title}</p>
                  </td>
                  <td className="px-4 py-3"><SeverityBadge severity={a.severity} /></td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={a.status}
                      onChange={(e) => updateMut.mutate({ id: a.id, s: e.target.value })}
                      className="bg-bg border border-border rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-accent"
                    >
                      {["open", "investigating", "resolved", "false_positive"].map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
// Project version: DeceptionGrid V1.6






