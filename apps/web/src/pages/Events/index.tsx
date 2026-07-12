import { useQuery } from "@tanstack/react-query";
import { eventsApi } from "@/api";
import { PageHeader, SeverityBadge, EventTypeBadge, LoadingSpinner, EmptyState } from "@/components/ui";
import { formatDistanceToNow } from "date-fns";
import { Zap } from "lucide-react";
import type { DeceptionEvent } from "@/types";
import { useState } from "react";

const SEVERITIES = ["", "low", "medium", "high", "critical"];

export function EventsPage() {
  const [severity, setSeverity] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["events", severity],
    queryFn: () => eventsApi.list({ limit: 100, severity: severity || undefined }),
  });

  const events: DeceptionEvent[] = data?.items || [];

  return (
    <div>
      <PageHeader title="Detection Events" subtitle={`${data?.total ?? 0} total events`} />

      <div className="flex gap-2 mb-4">
        {SEVERITIES.map((s) => (
          <button
            key={s}
            onClick={() => setSeverity(s)}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              severity === s ? "bg-accent/20 text-accent border border-accent/40" : "btn-ghost"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {isLoading ? <LoadingSpinner /> : events.length === 0 ? (
        <EmptyState icon={<Zap size={40} />} title="No events detected" description="Deception assets are monitoring for threats" />
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Event Type", "Source IP", "Severity", "Payload Preview", "Time"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3"><EventTypeBadge type={ev.event_type} /></td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-300">{ev.source_ip || "-"}</td>
                  <td className="px-4 py-3"><SeverityBadge severity={ev.severity} /></td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{ev.payload_preview || "-"}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{formatDistanceToNow(new Date(ev.created_at), { addSuffix: true })}</td>
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
