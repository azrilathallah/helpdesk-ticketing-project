import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { dashboardApi } from "../../api/dashboard";
import {
  Ticket,
  FolderOpen,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";

const TICKET_STATS = [
  {
    key: "total",
    label: "Total Tickets",
    desc: "All recorded requests",
    icon: Ticket,
    accent: "border-l-blue-500",
    count: "text-blue-600",
    iconBg: "bg-blue-50 text-blue-600 ring-blue-100",
  },
  {
    key: "open",
    label: "Open",
    desc: "Waiting to be processed",
    icon: FolderOpen,
    accent: "border-l-red-500",
    count: "text-red-600",
    iconBg: "bg-red-50 text-red-600 ring-red-100",
  },
  {
    key: "in_progress",
    label: "In Progress",
    desc: "Currently under review",
    icon: Clock,
    accent: "border-l-amber-500",
    count: "text-amber-600",
    iconBg: "bg-amber-50 text-amber-600 ring-amber-100",
  },
  {
    key: "closed",
    label: "Closed / Solved",
    desc: "Completed requests",
    icon: CheckCircle2,
    accent: "border-l-emerald-500",
    count: "text-emerald-600",
    iconBg: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  },
  {
    key: "rejected",
    label: "Rejected",
    desc: "Declined or cancelled",
    icon: XCircle,
    accent: "border-l-slate-500",
    count: "text-slate-600",
    iconBg: "bg-slate-100 text-slate-600 ring-slate-200",
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

  const todayFormatted = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    [],
  );

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
          err?.response?.data?.message || "Failed to get dashboard data",
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
    <div className="mx-auto w-full max-w-screen-2xl space-y-5">
      {/* 1. WELCOME BANNER */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-red-950 p-4 text-white shadow-md sm:p-6">
        {/* Decorative Background Glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur-sm">
            <Calendar className="h-3.5 w-3.5 text-red-500" />
            <span>{todayFormatted}</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {getGreeting()},{" "}
            <span className="text-red-500">{user?.name || "User"}</span>
          </h1>

          <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
            Welcome to Helpdesk System IBSW. <br></br>
            Track your IT & SAP requests, monitor ticket progress, and manage
            approvals in one place.
          </p>
        </div>
      </section>

      {/* ERROR ALERT */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-xs"
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

      {/* 2. STAT CARDS */}
      <section
        aria-label="Ticket statistics"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {TICKET_STATS.map(
          ({ key, label, desc, icon: Icon, accent, count, iconBg }) => {
            const value = stats[key] ?? 0;

            return (
              <article
                key={key}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 border-l-4 ${accent} bg-white p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {label}
                  </p>

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${iconBg} transition-transform duration-200 group-hover:scale-110`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div>
                  <p
                    className={`mt-2 text-2xl font-extrabold tabular-nums tracking-tight sm:text-3xl ${count}`}
                  >
                    {loading ? "—" : value}
                  </p>

                  <p className="mt-2 truncate text-[11px] text-slate-500">
                    {desc}
                  </p>
                </div>
              </article>
            );
          },
        )}
      </section>
    </div>
  );
}
