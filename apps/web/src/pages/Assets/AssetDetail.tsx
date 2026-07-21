import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assetsApi, eventsApi } from "@/api";
import {
  AssetTypeBadge,
  EmptyState,
  EventTypeBadge,
  LoadingSpinner,
  PageHeader,
  SeverityBadge,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import type { DeceptionAsset, DeceptionEvent } from "@/types";
import { Activity, ArrowLeft, Shield, Wrench } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function AssetDetailPage() {
  const { assetId } = useParams();
  const qc = useQueryClient();

  const { data: asset, isLoading } = useQuery<DeceptionAsset>({
    queryKey: ["asset", assetId],
    queryFn: () => assetsApi.get(assetId as string),
    enabled: Boolean(assetId),
  });
  const { data: events } = useQuery({
    queryKey: ["events", { asset_id: assetId }],
    queryFn: () => eventsApi.list({ asset_id: assetId, limit: 25 }),
    enabled: Boolean(assetId),
  });

  const statusMut = useMutation({
    mutationFn: (status: DeceptionAsset["status"]) => assetsApi.update(assetId as string, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["asset", assetId] });
      qc.invalidateQueries({ queryKey: ["assets"] });
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!asset) {
    return (
      <EmptyState
        icon={<Shield size={40} />}
        title="Asset not found"
        description="The requested deception asset is unavailable or outside this organization."
        action={<Link to="/assets" className="btn-primary">Back to assets</Link>}
      />
    );
  }

  const assetEvents: DeceptionEvent[] = events?.items || [];
  const criticalOrHigh = assetEvents.filter((event) => ["critical", "high"].includes(event.severity)).length;
  const lastEvent = assetEvents[0];
  const statuses: DeceptionAsset["status"][] = ["active", "maintenance", "inactive"];

  return (
    <div>
      <PageHeader
        title={asset.name}
        subtitle="Deception asset detail and event context"
        action={
          <Link to="/assets" className="btn-ghost flex items-center gap-2">
            <ArrowLeft size={14} />
            Back
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Status" value={asset.status.toUpperCase()} color={asset.status === "active" ? "success" : "warning"} />
        <StatCard label="Events" value={assetEvents.length} color="info" />
        <StatCard label="High Priority" value={criticalOrHigh} color={criticalOrHigh ? "danger" : "accent"} />
        <StatCard
          label="Last Seen"
          value={lastEvent ? formatDistanceToNow(new Date(lastEvent.created_at), { addSuffix: true }) : "No events"}
          color="accent"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <div className="card">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">ASSET PROFILE</p>
                <div className="flex flex-wrap items-center gap-2">
                  <AssetTypeBadge type={asset.type} />
                  <StatusBadge status={asset.status} />
                  <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-400 border border-border font-mono">
                    {asset.host ? `${asset.host}:${asset.port || "-"}` : "no endpoint label"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => statusMut.mutate(status)}
                    disabled={statusMut.isPending || asset.status === status}
                    className="btn-ghost text-xs"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-6">
              {asset.description || "No description has been added for this deception asset."}
            </p>
          </div>

          <div className="card">
            <p className="text-xs text-gray-500 mb-3 font-medium">RECENT EVENTS</p>
            <div className="divide-y divide-border">
              {assetEvents.length === 0 && (
                <p className="text-gray-600 text-sm py-4">No asset-scoped events yet.</p>
              )}
              {assetEvents.map((event) => (
                <div key={event.id} className="py-3 flex items-center gap-4">
                  <EventTypeBadge type={event.event_type} />
                  <span className="text-gray-300 text-sm font-mono flex-1">{event.source_ip || "unknown source"}</span>
                  <SeverityBadge severity={event.severity} />
                  <span className="text-gray-600 text-xs">
                    {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <p className="text-xs text-gray-500 mb-3 font-medium">SAFE OPERATING BOUNDARY</p>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex gap-3">
                <Shield size={16} className="text-success mt-0.5" />
                <p>Demo activity creates database records only and does not expose real services.</p>
              </div>
              <div className="flex gap-3">
                <Activity size={16} className="text-info mt-0.5" />
                <p>Events are scoped by organization and are intended for SOC investigation workflows.</p>
              </div>
              <div className="flex gap-3">
                <Wrench size={16} className="text-warning mt-0.5" />
                <p>Use maintenance status while changing labels, endpoints or demo metadata.</p>
              </div>
            </div>
          </div>

          <div className="card">
            <p className="text-xs text-gray-500 mb-3 font-medium">CONFIGURATION</p>
            <pre className="max-h-64 overflow-auto rounded bg-black/30 border border-border p-3 text-xs text-gray-400">
              {JSON.stringify(asset.config_json || {}, null, 2)}
            </pre>
          </div>

          <div className="card">
            <p className="text-xs text-gray-500 mb-3 font-medium">LIFECYCLE</p>
            <dl className="space-y-3 text-xs">
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-300">{new Date(asset.created_at).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Updated</dt>
                <dd className="text-gray-300">{new Date(asset.updated_at).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Asset ID</dt>
                <dd className="text-gray-500 font-mono break-all">{asset.id}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
// Project version: DeceptionGrid V1.6








