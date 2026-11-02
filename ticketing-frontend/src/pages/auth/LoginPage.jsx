import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition-shadow placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-100";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        "Login gagal. Coba lagi.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-red-950 to-red-700 px-4 py-10">
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-white-400/20 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-32 h-96 w-96 rounded-full bg-white-400/20 blur-3xl"
      />

      <section className="relative z-10 w-full max-w-md rounded-xl border border-white/30 bg-white p-7 shadow-2xl sm:p-10">
        <header className="mb-8 text-center">
          <div className="mb-5 flex justify-center">
            <img
              src="icon/IBS-logo.png"
              alt="IBSW"
              className="h-16 w-auto max-w-40 object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Helpdesk System
          </h1>

          <p className="mt-2 text-sm text-slate-500">Sign in to continue.</p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex min-w-0 flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className="text-sm font-semibold text-slate-700"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoFocus
              autoComplete="username"
              required
              className={inputClass}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <label
              htmlFor="login-password"
              className="text-sm font-semibold text-slate-700"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-transparent bg-red-600 px-5 py-3 text-[15px] font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-4.5 w-4.5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="31.4 31.4"
                    opacity="0.3"
                  />
                  <path
                    d="M22 12a10 10 0 0 0-10-10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
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
