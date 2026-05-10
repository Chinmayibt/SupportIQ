import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview";
import DashboardAnalytics from "./pages/DashboardAnalytics";
import DashboardPredictions from "./pages/DashboardPredictions";
import DashboardVoice from "./pages/DashboardVoice";
import DashboardLogs from "./pages/DashboardLogs";
import DashboardSettings from "./pages/DashboardSettings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<DashboardOverview />} />
          <Route path="analytics" element={<DashboardAnalytics />} />
          <Route path="predictions" element={<DashboardPredictions />} />
          <Route path="voice" element={<DashboardVoice />} />
          <Route path="logs" element={<DashboardLogs />} />
          <Route path="settings" element={<DashboardSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
