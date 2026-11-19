import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { approvalApi } from "../api/approval";
import {
  Plus,
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  LogOut,
  Menu,
} from "lucide-react";

const MENU_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/submission", label: "My Submission", icon: FileText },
  { to: "/approval", label: "Approval List", icon: ClipboardCheck },
];

const TERMINAL_STATUSES = [
  "TICKET_SOLVED",
  "TICKET_REJECTED",
  "TICKET_CANCELLED",
];

export default function Sidebar() {
  const { logout } = useAuth();
  const location = useLocation();
  const [approvalCount, setApprovalCount] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadApprovalCount = async () => {
      try {
        const response = await approvalApi.getAll();
        const submissions = response.data?.data || [];

        if (mounted) {
          setApprovalCount(
            submissions.filter(
              (item) =>
                Boolean(item.can_act) &&
                !TERMINAL_STATUSES.includes(item.status),
            ).length,
          );
        }
      } catch (error) {
        console.error("Failed to get approval count:", error);

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
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-sm lg:hidden">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label={isMobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isMobileOpen}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <img
              src="/logo-ibsw.png"
              alt="IBSW"
              className="h-7 w-7 shrink-0 object-contain"
            />
            <span className="text-sm font-bold tracking-tight text-slate-900">
              Helpdesk System IBSW
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px] transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col",
          "border-r border-slate-200/90 bg-white",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 p-1.5 ring-1 ring-slate-200/80">
              <img
                src="/logo-ibsw.png"
                alt="IBSW"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-slate-900">
                Helpdesk System IBSW
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action */}
        <div className="px-3.5 pt-4 pb-2">
          <NavLink
            to="/create-ticket"
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              [
                "flex w-full items-center justify-center gap-2 rounded-xl px-3.5 py-2.5",
                "bg-linear-to-r from-red-600 to-red-700 text-sm font-semibold text-white",
                "shadow-sm shadow-red-600/20 transition-all duration-200",
                "hover:from-red-700 hover:to-red-800 hover:shadow-md hover:shadow-red-600/25",
                "active:scale-[0.98]",
                isActive ? "ring-2 ring-red-200 ring-offset-2" : "",
              ].join(" ")
            }
          >
            <Plus className="h-4 w-4 shrink-0" strokeWidth={2.5} />
            <span>Create New Ticket</span>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Main navigation"
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-3.5 py-3"
        >
          <p className="mb-1.5 px-2.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Main Menu
          </p>

          {MENU_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                [
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150",
                  isActive
                    ? "bg-red-50/90 font-semibold text-red-700 ring-1 ring-red-100"
                    : "font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 h-5 w-1 rounded-r-full bg-red-600"
                    />
                  )}

                  <Icon
                    className={[
                      "h-4.5 w-4.5 shrink-0 transition-colors",
                      isActive
                        ? "text-red-600"
                        : "text-slate-400 group-hover:text-slate-600",
                    ].join(" ")}
                    strokeWidth={isActive ? 2.25 : 2}
                  />

                  <span className="min-w-0 flex-1 truncate">{label}</span>

                  {to === "/approval" && approvalCount > 0 && (
                    <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-2 text-[11px] leading-none font-bold text-white shadow-xs">
                      {approvalCount > 99 ? "99+" : approvalCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Footer & Logout */}
        <div className="border-t border-slate-100 p-3.5">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
