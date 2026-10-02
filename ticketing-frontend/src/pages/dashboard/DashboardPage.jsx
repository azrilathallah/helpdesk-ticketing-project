import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { dashboardApi } from "../../api/dashboard";

const TICKET_STATS = [
  {
    key: "total",
    label: "Total",
    color: "var(--stat-total)",
  },
  {
    key: "open",
    label: "Open",
    color: "var(--stat-open)",
  },
  {
    key: "in_progress",
    label: "In Progress",
    color: "var(--stat-progress)",
  },
  {
    key: "closed",
    label: "Closed",
    color: "var(--stat-closed)",
  },
  {
    key: "rejected",
    label: "Rejected",
    color: "var(--stat-rejected)",
  },
];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

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

        if (!mounted) {
          return;
        }

        setStats({
          total: response.data?.data?.total ?? 0,
          open: response.data?.data?.open ?? 0,
          in_progress:
            response.data?.data?.in_progress ?? 0,
          closed: response.data?.data?.closed ?? 0,
          rejected:
            response.data?.data?.rejected ?? 0,
        });
      } catch (err) {
        console.error("Dashboard error:", err);

        if (!mounted) {
          return;
        }

        setError(
          err.response?.data?.message ||
            "Gagal mengambil data dashboard."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      {/* Greeting */}
      <section className="dashboard__greeting">
        <h2 className="dashboard__greeting-text">
          {getGreeting()},{" "}
          <span className="dashboard__greeting-name">
            {user?.name || "User"}
          </span>
        </h2>

        <p className="dashboard__greeting-sub">
          Welcome to Helpdesk System IBS
        </p>
      </section>

      {/* Error */}
      {error && (
        <div className="dashboard__error">
          <span>!</span>

          <div>
            <strong>Failed to load dashboard</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <section className="dashboard__stats">
        {TICKET_STATS.map(
          ({ key, label, color }) => (
            <div
              key={key}
              className="stat-card"
              style={{
                "--stat-accent": color,
              }}
            >
              <div className="stat-card__bar" />

              <div className="stat-card__body">
                <span className="stat-card__count">
                  {loading ? "—" : stats[key]}
                </span>

                <span className="stat-card__label">
                  {label}
                </span>
              </div>
            </div>
          )
        )}
      </section>
    </>
  );
}