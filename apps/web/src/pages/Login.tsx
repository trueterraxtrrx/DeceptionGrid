import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Grid3x3 } from "lucide-react";
import { authApi } from "@/api";
import { useAuth } from "@/hooks/useAuth";

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "demo@deceptiongrid.io", password: "Demo1234!" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { access_token } = await authApi.login(form);
      login(access_token);
      nav("/dashboard");
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <Grid3x3 size={24} className="text-accent" />
          <div>
            <p className="text-white font-bold">DeceptionGrid</p>
            <p className="text-[10px] text-gray-500">by KRYNEX Labs</p>
          </div>
        </div>

        <div className="card">
          <h1 className="text-base font-semibold text-white mb-1">Sign in</h1>
          <p className="text-xs text-gray-500 mb-5">Enterprise Honeypot & Deception Platform</p>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Password</label>
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
            <button className="btn-primary w-full mt-4" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-xs text-gray-600 text-center mt-4">
          No account?{" "}
          <Link to="/register" className="text-accent hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
// Project version: DeceptionGrid V1.1
