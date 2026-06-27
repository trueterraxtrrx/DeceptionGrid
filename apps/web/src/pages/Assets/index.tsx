import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assetsApi } from "@/api";
import {
  PageHeader, StatusBadge, AssetTypeBadge, EmptyState,
  LoadingSpinner, Modal
} from "@/components/ui";
import { Eye, Plus, Shield, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { DeceptionAsset } from "@/types";

const ASSET_TYPES = ["fake_ssh", "fake_http_admin", "fake_database", "honeytoken", "fake_api"];

export function AssetsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", type: "fake_ssh", host: "", port: "", description: "" });

  const { data, isLoading } = useQuery({ queryKey: ["assets"], queryFn: () => assetsApi.list({ limit: 100 }) });

  const createMut = useMutation({
    mutationFn: (d: any) => assetsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assets"] }); setShowCreate(false); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => assetsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    createMut.mutate({ ...form, port: form.port ? parseInt(form.port) : undefined });
  };

  if (isLoading) return <LoadingSpinner />;
  const assets: DeceptionAsset[] = data?.items || [];

  return (
    <div>
      <PageHeader
        title="Deception Assets"
        subtitle={`${assets.length} assets deployed`}
        action={
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={14} /> New Asset
          </button>
        }
      />

      {assets.length === 0 ? (
        <EmptyState
          icon={<Shield size={40} />}
          title="No deception assets yet"
          description="Deploy your first honeypot or decoy endpoint"
          action={<button onClick={() => setShowCreate(true)} className="btn-primary">Deploy Asset</button>}
        />
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Name", "Type", "Host", "Status", "Deployed", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assets.map((a) => (
                <tr key={a.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">
                    <Link to={`/assets/${a.id}`} className="hover:text-accent transition-colors">
                      {a.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3"><AssetTypeBadge type={a.type} /></td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{a.host ? `${a.host}:${a.port || "-"}` : "-"}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/assets/${a.id}`}
                      className="mr-3 text-gray-600 hover:text-accent transition-colors"
                      aria-label={`View ${a.name}`}
                    >
                      <Eye size={14} className="inline" />
                    </Link>
                    <button
                      onClick={() => deleteMut.mutate(a.id)}
                      className="text-gray-600 hover:text-danger transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Deploy Deception Asset">
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Asset Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Type</label>
            <select
              className="input bg-bg"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {ASSET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Host</label>
              <input className="input" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="10.0.1.50" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Port</label>
              <input className="input" type="number" value={form.port} onChange={(e) => setForm({ ...form, port: e.target.value })} placeholder="22" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Description</label>
            <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={createMut.isPending}>
              {createMut.isPending ? "Deploying..." : "Deploy"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
