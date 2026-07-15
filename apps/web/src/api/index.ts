import axios from "axios";
import type { Alert, DeceptionAsset, DeceptionEvent, Honeytoken, User } from "@/types";

export const DEMO_MODE = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env.VITE_DEMO_MODE === "true";

const now = Date.now();
const iso = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();
const demoDelay = async <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 80));
const paginate = <T>(items: T[], limit = 50, offset = 0) => ({
  items: items.slice(offset, offset + limit),
  total: items.length,
  limit,
  offset,
});

const demoUser: User = {
  id: "demo-user",
  email: "demo@deceptiongrid.io",
  full_name: "Demo Analyst",
  role: "OWNER",
  organization_id: "demo-org",
  created_at: iso(7200),
};

let demoAssets: DeceptionAsset[] = [
  {
    id: "asset-ssh",
    organization_id: "demo-org",
    name: "Finance SSH Decoy",
    type: "fake_ssh",
    status: "active",
    host: "10.12.4.22",
    port: 22,
    description: "Synthetic SSH banner used to detect unauthorized lateral movement attempts.",
    config_json: { banner: "OpenSSH_8.9p1", zone: "finance", simulator_only: true },
    created_at: iso(7200),
    updated_at: iso(180),
  },
  {
    id: "asset-admin",
    organization_id: "demo-org",
    name: "Internal Admin Panel Decoy",
    type: "fake_http_admin",
    status: "active",
    host: "10.12.8.15",
    port: 8080,
    description: "Fake internal admin route for early reconnaissance detection.",
    config_json: { route: "/admin/login", zone: "internal", simulator_only: true },
    created_at: iso(6100),
    updated_at: iso(95),
  },
  {
    id: "asset-db",
    organization_id: "demo-org",
    name: "Database Banner Trap",
    type: "fake_database",
    status: "maintenance",
    host: "10.12.9.30",
    port: 5432,
    description: "Demo database decoy label for suspicious probe visibility.",
    config_json: { engine: "PostgreSQL", zone: "data", simulator_only: true },
    created_at: iso(5400),
    updated_at: iso(25),
  },
  {
    id: "asset-token",
    organization_id: "demo-org",
    name: "Cloud Backup Honeytoken",
    type: "honeytoken",
    status: "active",
    description: "Decoy token marker for controlled defensive environments.",
    config_json: { token_prefix: "dg-decoy-cloud", simulator_only: true },
    created_at: iso(3600),
    updated_at: iso(60),
  },
];

let demoEvents: DeceptionEvent[] = [
  {
    id: "event-1",
    organization_id: "demo-org",
    asset_id: "asset-token",
    event_type: "honeytoken_trigger",
    source_ip: "203.0.113.42",
    user_agent: "python-requests/2.31.0",
    payload_preview: "Honeytoken marker observed in synthetic request",
    metadata_json: { token_prefix: "dg-decoy-cloud", demo: true },
    severity: "critical",
    created_at: iso(12),
  },
  {
    id: "event-2",
    organization_id: "demo-org",
    asset_id: "asset-ssh",
    event_type: "ssh_login_attempt",
    source_ip: "198.51.100.7",
    user_agent: "OpenSSH_8.9p1",
    payload_preview: "SSH handshake with username=root and redacted credential field",
    metadata_json: { username: "root", credential: "redacted", demo: true },
    severity: "high",
    created_at: iso(34),
  },
  {
    id: "event-3",
    organization_id: "demo-org",
    asset_id: "asset-admin",
    event_type: "http_request",
    source_ip: "192.0.2.80",
    user_agent: "Mozilla/5.0 demo scanner",
    payload_preview: "GET /admin/login HTTP/1.1",
    metadata_json: { path: "/admin/login", demo: true },
    severity: "medium",
    created_at: iso(87),
  },
  {
    id: "event-4",
    organization_id: "demo-org",
    asset_id: "asset-db",
    event_type: "database_probe",
    source_ip: "203.0.113.99",
    payload_preview: "PostgreSQL banner probe",
    metadata_json: { banner: "PostgreSQL", demo: true },
    severity: "high",
    created_at: iso(144),
  },
];

let demoAlerts: Alert[] = [
  {
    id: "alert-1",
    organization_id: "demo-org",
    asset_id: "asset-token",
    event_id: "event-1",
    title: "Honeytoken marker triggered from synthetic external source",
    severity: "critical",
    status: "open",
    created_at: iso(12),
    updated_at: iso(12),
  },
  {
    id: "alert-2",
    organization_id: "demo-org",
    asset_id: "asset-ssh",
    event_id: "event-2",
    title: "Repeated SSH interaction with finance decoy",
    severity: "high",
    status: "investigating",
    created_at: iso(34),
    updated_at: iso(20),
  },
  {
    id: "alert-3",
    organization_id: "demo-org",
    asset_id: "asset-admin",
    event_id: "event-3",
    title: "Internal admin panel decoy received suspicious request",
    severity: "medium",
    status: "open",
    created_at: iso(87),
    updated_at: iso(87),
  },
];

let demoHoneytokens: Honeytoken[] = [
  {
    id: "token-1",
    organization_id: "demo-org",
    name: "Cloud Backup API Key Decoy",
    token_type: "api_key_decoy",
    token_prefix: "dg-decoy-cloud",
    status: "triggered",
    trigger_count: 2,
    last_triggered_at: iso(12),
    created_at: iso(3600),
  },
  {
    id: "token-2",
    organization_id: "demo-org",
    name: "Build Pipeline URL Canary",
    token_type: "url_canary",
    token_prefix: "dg-decoy-build",
    status: "active",
    trigger_count: 0,
    created_at: iso(2600),
  },
];

export const api = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("dg_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("dg_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (_d: { email: string; password: string; full_name: string; organization_name: string }) =>
    DEMO_MODE ? demoDelay({ access_token: "demo-token", token_type: "bearer" }) : api.post("/auth/register", _d).then((r) => r.data),
  login: (_d: { email: string; password: string }) =>
    DEMO_MODE ? demoDelay({ access_token: "demo-token", token_type: "bearer" }) : api.post("/auth/login", _d).then((r) => r.data),
  me: () => (DEMO_MODE ? demoDelay(demoUser) : api.get("/me").then((r) => r.data)),
};

export const dashboardApi = {
  stats: () => {
    if (!DEMO_MODE) return api.get("/dashboard/stats").then((r) => r.data);
    const severity_distribution = demoEvents.reduce<Record<string, number>>((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {});
    const top_source_ips = Object.entries(demoEvents.reduce<Record<string, number>>((acc, event) => {
      if (event.source_ip) acc[event.source_ip] = (acc[event.source_ip] || 0) + 1;
      return acc;
    }, {})).map(([ip, count]) => ({ ip, count }));
    return demoDelay({
      total_assets: demoAssets.length,
      active_assets: demoAssets.filter((asset) => asset.status === "active").length,
      events_last_24h: demoEvents.length,
      open_alerts: demoAlerts.filter((alert) => alert.status === "open").length,
      critical_alerts: demoAlerts.filter((alert) => alert.status === "open" && alert.severity === "critical").length,
      top_source_ips,
      severity_distribution,
    });
  },
};

export const assetsApi = {
  list: (p?: { limit?: number; offset?: number; status?: string }) =>
    DEMO_MODE
      ? demoDelay(paginate(demoAssets.filter((asset) => !p?.status || asset.status === p.status), p?.limit, p?.offset))
      : api.get("/assets", { params: p }).then((r) => r.data),
  create: (d: Partial<DeceptionAsset>) => {
    if (!DEMO_MODE) return api.post("/assets", d).then((r) => r.data);
    const asset = {
      id: `asset-${Date.now()}`,
      organization_id: "demo-org",
      status: "active" as const,
      config_json: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...d,
    } as DeceptionAsset;
    demoAssets = [asset, ...demoAssets];
    return demoDelay(asset);
  },
  get: (id: string) => (DEMO_MODE ? demoDelay(demoAssets.find((asset) => asset.id === id)) : api.get(`/assets/${id}`).then((r) => r.data)),
  update: (id: string, d: Partial<DeceptionAsset>) => {
    if (!DEMO_MODE) return api.patch(`/assets/${id}`, d).then((r) => r.data);
    demoAssets = demoAssets.map((asset) => asset.id === id ? { ...asset, ...d, updated_at: new Date().toISOString() } : asset);
    return demoDelay(demoAssets.find((asset) => asset.id === id));
  },
  delete: (id: string) => {
    if (!DEMO_MODE) return api.delete(`/assets/${id}`);
    demoAssets = demoAssets.filter((asset) => asset.id !== id);
    return demoDelay({});
  },
};

export const eventsApi = {
  list: (p?: { limit?: number; offset?: number; severity?: string; asset_id?: string }) =>
    DEMO_MODE
      ? demoDelay(paginate(demoEvents.filter((event) => (!p?.severity || event.severity === p.severity) && (!p?.asset_id || event.asset_id === p.asset_id)), p?.limit, p?.offset))
      : api.get("/events", { params: p }).then((r) => r.data),
  get: (id: string) => (DEMO_MODE ? demoDelay(demoEvents.find((event) => event.id === id)) : api.get(`/events/${id}`).then((r) => r.data)),
};

export const alertsApi = {
  list: (p?: { limit?: number; offset?: number; status?: string; severity?: string }) =>
    DEMO_MODE
      ? demoDelay(paginate(demoAlerts.filter((alert) => (!p?.status || alert.status === p.status) && (!p?.severity || alert.severity === p.severity)), p?.limit, p?.offset))
      : api.get("/alerts", { params: p }).then((r) => r.data),
  get: (id: string) => (DEMO_MODE ? demoDelay(demoAlerts.find((alert) => alert.id === id)) : api.get(`/alerts/${id}`).then((r) => r.data)),
  updateStatus: (id: string, status: string) => {
    if (!DEMO_MODE) return api.patch(`/alerts/${id}/status`, { status }).then((r) => r.data);
    demoAlerts = demoAlerts.map((alert) => alert.id === id ? { ...alert, status: status as Alert["status"], updated_at: new Date().toISOString() } : alert);
    return demoDelay(demoAlerts.find((alert) => alert.id === id));
  },
};

export const honeytokensApi = {
  list: (p?: { limit?: number; offset?: number }) =>
    DEMO_MODE ? demoDelay(paginate(demoHoneytokens, p?.limit, p?.offset)) : api.get("/honeytokens", { params: p }).then((r) => r.data),
  create: (d: { name: string; token_type: string }) => {
    if (!DEMO_MODE) return api.post("/honeytokens", d).then((r) => r.data);
    const raw_token = `dg-decoy-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    const token = {
      id: `token-${Date.now()}`,
      organization_id: "demo-org",
      token_prefix: raw_token.slice(0, 16),
      status: "active" as const,
      trigger_count: 0,
      created_at: new Date().toISOString(),
      raw_token,
      ...d,
    } as Honeytoken;
    demoHoneytokens = [token, ...demoHoneytokens];
    return demoDelay(token);
  },
  delete: (id: string) => {
    if (!DEMO_MODE) return api.delete(`/honeytokens/${id}`);
    demoHoneytokens = demoHoneytokens.filter((token) => token.id !== id);
    return demoDelay({});
  },
};

export const auditApi = {
  list: (p?: { limit?: number; offset?: number }) =>
    DEMO_MODE ? demoDelay(paginate([], p?.limit, p?.offset)) : api.get("/audit-logs", { params: p }).then((r) => r.data),
};

export const demoApi = {
  simulateSsh: () => (DEMO_MODE ? createDemoEvent("asset-ssh", "ssh_login_attempt", "high") : api.post("/demo/simulate/ssh-login").then((r) => r.data)),
  simulateAdmin: () => (DEMO_MODE ? createDemoEvent("asset-admin", "http_request", "medium") : api.post("/demo/simulate/admin-panel-hit").then((r) => r.data)),
  simulateDatabase: () => (DEMO_MODE ? createDemoEvent("asset-db", "database_probe", "high") : api.post("/demo/simulate/database-probe").then((r) => r.data)),
  simulateHoneytoken: () => (DEMO_MODE ? createDemoEvent("asset-token", "honeytoken_trigger", "critical") : api.post("/demo/simulate/honeytoken-trigger").then((r) => r.data)),
};

function createDemoEvent(asset_id: string, event_type: DeceptionEvent["event_type"], severity: DeceptionEvent["severity"]) {
  const event: DeceptionEvent = {
    id: `event-${Date.now()}`,
    organization_id: "demo-org",
    asset_id,
    event_type,
    source_ip: "198.51.100.44",
    user_agent: "DeceptionGrid demo simulator",
    payload_preview: "Synthetic demo interaction generated locally",
    metadata_json: { demo: true, simulator_only: true },
    severity,
    created_at: new Date().toISOString(),
  };
  demoEvents = [event, ...demoEvents];
  if (["medium", "high", "critical"].includes(severity)) {
    demoAlerts = [{
      id: `alert-${Date.now()}`,
      organization_id: "demo-org",
      asset_id,
      event_id: event.id,
      title: `Synthetic ${event_type.replace(/_/g, " ")} event generated by safe demo simulator`,
      severity,
      status: "open",
      created_at: event.created_at,
      updated_at: event.created_at,
    }, ...demoAlerts];
  }
  return demoDelay(event);
}
// Project version: DeceptionGrid V1.6






