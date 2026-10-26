import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { approvalApi } from "../api/approval";

const NAV_ITEMS = [
  { to: "/create-ticket", label: "Create New", icon: PlusIcon },
  { to: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { to: "/submission", label: "My Submission", icon: SubmissionIcon },
  { to: "/approval", label: "Approval List", icon: ApprovalIcon },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const [approvalCount, setApprovalCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadApprovalCount = async () => {
      try {
        const response = await approvalApi.getAll();
        const submissions = response.data?.data || [];

        if (mounted) {
          setApprovalCount(submissions.length);
        }
      } catch (error) {
        console.error("Gagal mengambil jumlah approval:", error);

        if (mounted) {
          setApprovalCount(0);
        }
      }
    };

    loadApprovalCount();

    const interval = setInterval(loadApprovalCount, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-slate-200 bg-white shadow-sm lg:flex">
      <div className="border-b border-slate-200 px-5 py-6">
        <div className="flex items-center gap-3">
          <img
            src="/logo-ibsw.png"
            alt="IBSW"
            className="h-8 w-8 shrink-0 object-contain"
          />

          <span className="font-bold tracking-tight text-slate-900">
            Helpdesk System IBS
          </span>
        </div>
      </div>

      <nav
        aria-label="Navigasi utama"
        className="flex flex-1 flex-col gap-1 overflow-y-auto p-3"
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "relative flex items-center gap-3 rounded-lg px-3 py-2",
                "text-sm font-medium no-underline transition-colors",
                isActive
                  ? "bg-red-100 font-semibold text-red-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={
                    isActive
                      ? "h-5 w-5 shrink-0 text-red-600"
                      : "h-5 w-5 shrink-0 text-slate-400"
                  }
                />

                <span className="min-w-0 flex-1">{label}</span>

                {to === "/approval" && approvalCount > 0 && (
                  <span className="ml-auto inline-flex h-5.5 min-w-5.5 items-center justify-center rounded-full bg-red-700 px-3 text-[11px] leading-none font-bold text-white shadow-sm">
                    {approvalCount > 99 ? "99+" : approvalCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-600 transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
        >
          <LogoutIcon className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

function IconBase({ children, className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

function PlusIcon({ className }) {
  return (
    <IconBase className={className}>
      <path
        fillRule="evenodd"
        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
        clipRule="evenodd"
      />
    </IconBase>
  );
}

function DashboardIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </IconBase>
  );
}

function SubmissionIcon({ className }) {
  return (
    <IconBase className={className}>
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
        clipRule="evenodd"
      />
    </IconBase>
  );
}

function ApprovalIcon({ className }) {
  return (
    <IconBase className={className}>
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </IconBase>
  );
}

function LogoutIcon({ className }) {
  return (
    <IconBase className={className}>
      <path
        fillRule="evenodd"
        d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
        clipRule="evenodd"
      />
    </IconBase>
  );
}
