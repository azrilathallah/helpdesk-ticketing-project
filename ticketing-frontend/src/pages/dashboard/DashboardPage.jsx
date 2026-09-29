import { useAuth } from '../../context/AuthContext';

const TICKET_STATS = [
  { label: 'Total',       count: 0, color: 'var(--stat-total)' },
  { label: 'Open',        count: 0, color: 'var(--stat-open)' },
  { label: 'In Progress', count: 0, color: 'var(--stat-progress)' },
  { label: 'Closed',      count: 0, color: 'var(--stat-closed)' },
  { label: 'Rejected',    count: 0, color: 'var(--stat-rejected)' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      {/* Greeting */}
      <section className="dashboard__greeting">
        <h2 className="dashboard__greeting-text">
          {getGreeting()}, <span className="dashboard__greeting-name">{user?.name}</span>
        </h2>
        <p className="dashboard__greeting-sub">
          Welcome to Helpdesk System IBS
        </p>
      </section>

      {/* Stats Cards */}
      <section className="dashboard__stats">
        {TICKET_STATS.map(({ label, count, color }) => (
          <div key={label} className="stat-card" style={{ '--stat-accent': color }}>
            <div className="stat-card__bar" />
            <div className="stat-card__body">
              <span className="stat-card__count">{count}</span>
              <span className="stat-card__label">{label}</span>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}