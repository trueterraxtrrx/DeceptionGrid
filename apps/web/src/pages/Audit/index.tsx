import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/api";
import { PageHeader, LoadingSpinner, EmptyState } from "@/components/ui";
import { ScrollText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { AuditLog } from "@/types";

export function AuditPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["audit"],
    queryFn: () => auditApi.list({ limit: 100 }),
  });

  const logs: AuditLog[] = data?.items || [];

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle={`${data?.total ?? 0} records`} />

      {isLoading ? <LoadingSpinner /> : logs.length === 0 ? (
        <EmptyState icon={<ScrollText size={40} />} title="No audit logs" />
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Action", "Resource", "User", "IP", "Time"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-accent">{l.action}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {l.resource_type ? `${l.resource_type}` : "-"}
                    {l.resource_id && <span className="text-gray-600 ml-1">#{l.resource_id.slice(0, 8)}</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                    {l.user_id ? l.user_id.slice(0, 8) + "…" : "system"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs font-mono">{l.ip_address || "-"}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}
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
// Project version: DeceptionGrid V1.3
