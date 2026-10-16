import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { dashboardApi } from "../../api/dashboard";

const TICKET_STATS = [
  {
    key: "total",
    label: "Total",
    accent: "border-l-slate-500",
    count: "text-slate-800",
  },
  {
    key: "open",
    label: "Open",
    accent: "border-l-blue-500",
    count: "text-blue-600",
  },
  {
    key: "in_progress",
    label: "In Progress",
    accent: "border-l-amber-500",
    count: "text-amber-600",
  },
  {
    key: "closed",
    label: "Closed",
    accent: "border-l-green-500",
    count: "text-green-600",
  },
  {
    key: "rejected",
    label: "Rejected",
    accent: "border-l-red-500",
    count: "text-red-600",
  },
];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";

  return "Good Evening";
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    closed: 0,
    rejected: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await dashboardApi.getStats();

        if (!mounted) return;

        const data = response.data?.data || {};

        setStats({
          total: data.total ?? 0,
          open: data.open ?? 0,
          in_progress: data.in_progress ?? 0,
          closed: data.closed ?? 0,
          rejected: data.rejected ?? 0,
        });
      } catch (err) {
        console.error("Dashboard error:", err);

        if (!mounted) return;

        setError(
          err.response?.data?.message || "Gagal mengambil data dashboard.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-screen-2xl">
      <section className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {getGreeting()},{" "}
          <span className="text-red-600">{user?.name || "User"}</span>
        </h1>

        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          Welcome to Helpdesk System IBS
        </p>
      </section>

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
            !
          </span>

          <div className="min-w-0">
            <strong className="font-semibold">Failed to load dashboard</strong>

            <p className="mt-1 wrap-break-word text-sm">{error}</p>
          </div>
        </div>
      )}

      <section
        aria-label="Ticket statistics"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
      >
        {TICKET_STATS.map(({ key, label, accent, count }) => (
          <article
            key={key}
            className={`min-w-0 rounded-xl border border-slate-200 border-l-4 ${accent} bg-white px-3 py-2 shadow-sm transition-shadow hover:shadow-md`}
          >
            <div className="flex min-h-10 sm:min-h-20 flex-col justify-between gap-2">
              <span className={`text-xl sm:text-2xl font-bold tracking-tight ${count}`}>
                {loading ? "—" : stats[key]}
              </span>

              <span className={`text-sm sm:text-lg font-medium ${count}`}>
                {label}
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
