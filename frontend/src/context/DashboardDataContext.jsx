import { createContext, useContext } from "react";
import { useDashboardData } from "../hooks/useDashboardData";

const DashboardDataContext = createContext(null);

export function DashboardDataProvider({ children }) {
  const value = useDashboardData(100);
  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}

export function useDashboardContext() {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) {
    throw new Error("useDashboardContext must be used within DashboardDataProvider");
  }
  return ctx;
}
