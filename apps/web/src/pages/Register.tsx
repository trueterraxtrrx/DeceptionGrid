import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Grid3x3 } from "lucide-react";
import { authApi } from "@/api";
import { useAuth } from "@/hooks/useAuth";

export function RegisterPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", full_name: "", organization_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { access_token } = await authApi.register(form);
      login(access_token);
      nav("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail?.error?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

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
          <h1 className="text-base font-semibold text-white mb-5">Create account</h1>
          <form onSubmit={submit} className="space-y-3">
            {[
              { label: "Full name", key: "full_name", type: "text" },
              { label: "Organization name", key: "organization_name", type: "text" },
              { label: "Email", key: "email", type: "email" },
              { label: "Password", key: "password", type: "password" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                <input className="input" type={type} onChange={f(key)} required />
              </div>
            ))}
            {error && <p className="text-xs text-danger">{error}</p>}
            <button className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
        </div>
        <p className="text-xs text-gray-600 text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
// Project version: DeceptionGrid V1.6

