import { Bell, Menu, Search, Sparkles } from "lucide-react";

export default function TopNavbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-[#E5E7EB] bg-white px-4 shadow-sm md:px-6">
      <button
        type="button"
        className="rounded-lg p-2 text-[#6B7280] transition-colors hover:bg-[#F5F7FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] md:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6366F1]/10 text-[#6366F1]">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-semibold text-[#111827]">AI Support Intelligence Platform</p>
          <p className="truncate text-xs text-[#6B7280]">Real-time ticket automation with multilingual and voice</p>
        </div>
      </div>
      <div className="mx-auto hidden max-w-md flex-1 md:flex">
        <label className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="search"
            placeholder="Search (UI preview)"
            className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F7FB] py-2 pl-10 pr-4 text-sm text-[#111827] placeholder:text-[#6B7280] focus:border-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20"
            readOnly
          />
        </label>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          className="rounded-xl p-2 text-[#6B7280] transition-colors hover:bg-[#F5F7FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-xs font-semibold text-white shadow-sm"
          title="User"
        >
          U
        </div>
      </div>
    </header>
  );
}
