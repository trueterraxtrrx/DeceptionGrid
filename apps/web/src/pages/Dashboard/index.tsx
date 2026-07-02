import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardApi, eventsApi, demoApi } from "@/api";
import { StatCard, SeverityBadge, EventTypeBadge, PageHeader, LoadingSpinner } from "@/components/ui";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatDistanceToNow } from "date-fns";
import type { DeceptionEvent } from "@/types";
import { Zap } from "lucide-react";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#3b82f6"
};

export function DashboardPage() {
  const qc = useQueryClient();
  const { data: stats, isLoading } = useQuery({ queryKey: ["stats"], queryFn: dashboardApi.stats, refetchInterval: 30000 });
  const { data: events } = useQuery({ queryKey: ["events", { limit: 10 }], queryFn: () => eventsApi.list({ limit: 10 }) });

  const simMut = useMutation({
    mutationFn: demoApi.simulateSsh,
    onSuccess: () => { qc.invalidateQueries(); }
  });

  if (isLoading) return <LoadingSpinner />;

  const pieData = Object.entries(stats?.severity_distribution || {}).map(([name, value]) => ({ name, value }));
  const ipData = (stats?.top_source_ips || []).slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Security Overview"
        subtitle="DeceptionGrid threat detection dashboard"
        action={
          <button onClick={() => simMut.mutate()} className="btn-primary flex items-center gap-2">
            <Zap size={14} />
            Simulate Event
          </button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Assets" value={stats?.total_assets ?? 0} color="accent" />
        <StatCard label="Active Assets" value={stats?.active_assets ?? 0} color="success" />
        <StatCard label="Events (24h)" value={stats?.events_last_24h ?? 0} color="info" />
        <StatCard label="Open Alerts" value={stats?.open_alerts ?? 0} color="warning" />
        <StatCard label="Critical Alerts" value={stats?.critical_alerts ?? 0} color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Top IPs */}
        <div className="card lg:col-span-2">
          <p className="text-xs text-gray-500 mb-3 font-medium">TOP SOURCE IPs</p>
          {ipData.length === 0 ? (
            <p className="text-gray-600 text-sm">No events yet - simulate a safe demo event above</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={ipData} layout="vertical">
                <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} />
                <YAxis type="category" dataKey="ip" tick={{ fill: "#9ca3af", fontSize: 11 }} width={110} />
                <Tooltip contentStyle={{ background: "#111318", border: "1px solid #1e2130", borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="count" fill="#00e5ff" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Severity pie */}
        <div className="card">
          <p className="text-xs text-gray-500 mb-3 font-medium">SEVERITY DISTRIBUTION</p>
          {pieData.length === 0 ? (
            <p className="text-gray-600 text-sm">No data</p>
          ) : (
            <div className="flex flex-col items-center">
              <PieChart width={140} height={140}>
                <Pie data={pieData} cx={65} cy={65} innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || "#6b7280"} />
                  ))}
                </Pie>
              </PieChart>
              <div className="space-y-1 mt-2 w-full">
                {pieData.map((e) => (
                  <div key={e.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: SEVERITY_COLORS[e.name] || "#6b7280" }} />
                      <span className="text-gray-400 capitalize">{e.name}</span>
                    </div>
                    <span className="text-white font-medium">{e.value as number}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent events */}
      <div className="card">
        <p className="text-xs text-gray-500 mb-3 font-medium">RECENT EVENTS</p>
        <div className="divide-y divide-border">
          {(events?.items || []).length === 0 && (
            <p className="text-gray-600 text-sm py-4">No events yet</p>
          )}
          {(events?.items as DeceptionEvent[] || []).map((ev) => (
            <div key={ev.id} className="py-2.5 flex items-center gap-4">
              <EventTypeBadge type={ev.event_type} />
              <span className="text-gray-300 text-sm font-mono flex-1">{ev.source_ip || "unknown"}</span>
              <SeverityBadge severity={ev.severity} />
              <span className="text-gray-600 text-xs">{formatDistanceToNow(new Date(ev.created_at), { addSuffix: true })}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// Project version: DeceptionGrid V1.2
