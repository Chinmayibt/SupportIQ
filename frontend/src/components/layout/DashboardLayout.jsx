import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ActionTodosProvider } from "../../context/ActionTodosContext";
import { DashboardDataProvider } from "../../context/DashboardDataContext";
import TopNavbar from "./TopNavbar";
import AppSidebar from "./AppSidebar";

function DashboardShell() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <TopNavbar onMenuClick={() => setMobileSidebarOpen(true)} />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <AppSidebar
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
        <main className="flex-1 space-y-8 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <DashboardDataProvider>
      <ActionTodosProvider>
        <DashboardShell />
      </ActionTodosProvider>
    </DashboardDataProvider>
  );
}
