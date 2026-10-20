import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Input, Button, Alert } from "../../components/ui";

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
      {/* Decorative background */}
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
          <div className="mb-5">
            <Alert type="error">{error}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Email"
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoFocus
            autoComplete="username"
            required
          />

          <Input
            label="Password"
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="mt-1"
          >
            Sign In
          </Button>
        </form>
      </section>
    </main>
  );
}
