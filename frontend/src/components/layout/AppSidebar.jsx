import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Mic,
  Settings,
  BarChart3,
  ClipboardList,
  LineChart,
  X,
} from "lucide-react";

const items = [
  { to: "/dashboard/overview", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/predictions", label: "Predictions", icon: LineChart },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/logs", label: "Logs", icon: ClipboardList },
  { to: "/dashboard/voice", label: "Voice Support", icon: Mic },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const linkClass = ({ isActive }) =>
  [
    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
    isActive
      ? "border-l-4 border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1]"
      : "border-l-4 border-transparent text-[#6B7280] hover:bg-[#F5F7FB] hover:text-[#111827]",
  ].join(" ");

export default function AppSidebar({ mobileOpen, onClose }) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-foreground/20 md:hidden"
          aria-label="Close menu"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={[
          "fixed left-0 top-16 z-50 flex h-[calc(100vh-4rem)] w-[250px] shrink-0 flex-col border-r border-[#E5E7EB] bg-white shadow-sm transition-transform md:static md:top-auto md:z-0 md:h-auto md:min-h-[calc(100vh-4rem)] md:translate-x-0 md:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-[#E5E7EB] p-4 md:hidden">
          <span className="text-sm font-semibold text-[#111827]">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#6B7280] hover:bg-[#F5F7FB]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={linkClass}
              onClick={onClose}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
