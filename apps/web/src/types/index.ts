export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id: string;
  created_at: string;
}

export interface DeceptionAsset {
  id: string;
  organization_id: string;
  name: string;
  type: "fake_ssh" | "fake_http_admin" | "fake_database" | "honeytoken" | "fake_api";
  status: "active" | "inactive" | "maintenance";
  host?: string;
  port?: number;
  description?: string;
  config_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DeceptionEvent {
  id: string;
  organization_id: string;
  asset_id?: string;
  event_type: string;
  source_ip?: string;
  user_agent?: string;
  payload_preview?: string;
  metadata_json: Record<string, unknown>;
  severity: "low" | "medium" | "high" | "critical";
  created_at: string;
}

export interface Alert {
  id: string;
  organization_id: string;
  asset_id?: string;
  event_id?: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved" | "false_positive";
  created_at: string;
  updated_at: string;
}

export interface Honeytoken {
  id: string;
  organization_id: string;
  name: string;
  token_type: string;
  token_prefix?: string;
  status: "active" | "triggered" | "inactive";
  trigger_count: number;
  last_triggered_at?: string;
  created_at: string;
  raw_token?: string; // only on create
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  created_at: string;
}

export interface DashboardStats {
  total_assets: number;
  active_assets: number;
  events_last_24h: number;
  open_alerts: number;
  critical_alerts: number;
  top_source_ips: Array<{ ip: string; count: number }>;
  severity_distribution: Record<string, number>;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
// Project version: DeceptionGrid V1.6



