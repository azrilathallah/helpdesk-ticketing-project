import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        "Login failed. Try agaim.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-red-950 to-red-800 px-4 py-10">
      {/* Background Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-red-500/5 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-32 h-96 w-96 rounded-full bg-white/10 blur-3xl"
      />

      <section className="relative z-10 w-full max-w-md rounded-2xl border border-white/20 bg-white p-7 shadow-2xl sm:p-10">
        <header className="mb-7 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center">
              <img
                src="/logo-ibsw.png"
                alt="IBSW"
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Helpdesk System
          </h1>

          <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
            Sign in to continue.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs text-red-800"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <span className="min-w-0 flex-1">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className="text-xs font-semibold text-slate-700"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoFocus
                autoComplete="username"
                required
                className={`${inputClass} pr-3.5 pl-10`}
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <label
              htmlFor="login-password"
              className="text-xs font-semibold text-slate-700"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className={`${inputClass} pr-10 pl-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-red-600 to-red-700 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-red-600/20 transition-all duration-200 hover:from-red-700 hover:to-red-800 hover:shadow-md focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
