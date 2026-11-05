import { NavLink } from "react-router-dom";
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

const NAV_ITEMS = [
  { to: "/create-ticket", label: "Create New", icon: Plus, primary: true },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/submission", label: "My Submission", icon: FileText },
  { to: "/approval", label: "Approval List", icon: ClipboardCheck },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const [approvalCount, setApprovalCount] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
  }, []);

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-12 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label={isMobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isMobileOpen}
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col",
          "border-r border-slate-200 bg-white shadow-sm",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="border-b border-slate-200 px-3 py-4 ">
          <div className="flex items-center gap-2 ">
            <img
              src="/logo-ibsw.png"
              alt="IBSW"
              className="h-10 w-10 shrink-0 object-contain"
            />

            <span className="font-bold tracking-tight text-slate-900">
              Helpdesk System IBSW
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Main navigation"
          className="flex flex-1 flex-col gap-2 overflow-y-auto p-3"
        >
          {NAV_ITEMS.map(({ to, label, icon: Icon, primary }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                [
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5",
                  "text-sm font-medium no-underline transition-all duration-200",

                  primary
                    ? [
                        "mb-2 bg-red-700 text-white shadow-sm",
                        "hover:bg-red-800 hover:shadow-md",
                        "active:scale-[0.98]",
                        isActive ? "ring-2 ring-red-200 ring-offset-2" : "",
                      ].join(" ")
                    : isActive
                      ? "bg-red-50 font-semibold text-red-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={
                      primary
                        ? "h-5 w-5 shrink-0 text-white"
                        : isActive
                          ? "h-5 w-5 shrink-0 text-red-600"
                          : "h-5 w-5 shrink-0 text-slate-400"
                    }
                    strokeWidth={primary ? 2.5 : 2}
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

        {/* Logout */}
        <div className="border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-600 transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
