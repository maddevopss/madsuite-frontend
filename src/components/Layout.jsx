import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ActivitySuggestionPopup from "./activity-intelligence/ActivitySuggestionPopup";
import AiCopilot from "./AiCopilot/AiCopilot";
import "./layout/appShell.css";

export default function Layout() {
  return (
    <div className="app">
      <Header />
      <div className="container">
        <Sidebar />
        <main className="main">
          <Outlet />
        </main>
      </div>
      <ActivitySuggestionPopup />
      <AiCopilot />
    </div>
  );
}
