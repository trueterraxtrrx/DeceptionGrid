import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { honeytokensApi } from "@/api";
import { PageHeader, StatusBadge, LoadingSpinner, EmptyState, Modal } from "@/components/ui";
import { Key, Plus, Trash2, Copy, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Honeytoken } from "@/types";

const TOKEN_TYPES = ["api_key_decoy", "credential_marker", "url_canary", "file_canary"];

export function HoneytokensPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: "", token_type: "api_key_decoy" });

  const { data, isLoading } = useQuery({
    queryKey: ["honeytokens"],
    queryFn: () => honeytokensApi.list({ limit: 100 }),
  });

  const createMut = useMutation({
    mutationFn: (d: any) => honeytokensApi.create(d),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["honeytokens"] });
      setNewToken(res.raw_token);
      setShowCreate(false);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => honeytokensApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["honeytokens"] }),
  });

  const copy = () => {
    if (newToken) {
      navigator.clipboard.writeText(newToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tokens: Honeytoken[] = data?.items || [];

  return (
    <div>
      <PageHeader
        title="Honeytokens"
        subtitle="Decoy credential markers - not real secrets"
        action={
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={14} /> Generate Token
          </button>
        }
      />

      {isLoading ? <LoadingSpinner /> : tokens.length === 0 ? (
        <EmptyState
          icon={<Key size={40} />}
          title="No honeytokens yet"
          description="Generate decoy tokens to plant in your infrastructure"
          action={<button onClick={() => setShowCreate(true)} className="btn-primary">Generate Token</button>}
        />
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Name", "Type", "Prefix", "Status", "Triggers", "Created", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tokens.map((t) => (
                <tr key={t.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{t.name}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{t.token_type}</td>
                  <td className="px-4 py-3 font-mono text-xs text-accent">{t.token_prefix || "-"}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-mono font-bold ${t.trigger_count > 0 ? "text-danger" : "text-gray-500"}`}>
                      {t.trigger_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteMut.mutate(t.id)}
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

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Generate Honeytoken">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }} className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Token Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. AWS Backup Key Decoy"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Token Type</label>
            <select
              className="input bg-bg"
              value={form.token_type}
              onChange={(e) => setForm({ ...form, token_type: e.target.value })}
            >
              {TOKEN_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <p className="text-xs text-gray-500 bg-warning/5 border border-warning/20 rounded p-2">
            The raw token is shown only once after creation. Store it safely to plant in your environment.
          </p>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={createMut.isPending}>
              {createMut.isPending ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Raw token reveal modal */}
      <Modal open={!!newToken} onClose={() => setNewToken(null)} title="Token Generated - Copy Now">
        <div className="space-y-3">
          <p className="text-xs text-gray-400">This is the only time the raw token will be shown. Plant it in your environment as a decoy credential.</p>
          <div className="flex items-center gap-2 bg-bg border border-border rounded p-3">
            <code className="flex-1 text-xs text-accent font-mono break-all">{newToken}</code>
            <button onClick={copy} className="text-gray-500 hover:text-white transition-colors shrink-0">
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            </button>
          </div>
          <button onClick={() => setNewToken(null)} className="btn-primary w-full">Done</button>
        </div>
      </Modal>
    </div>
  );
}
// Project version: DeceptionGrid V1.6
