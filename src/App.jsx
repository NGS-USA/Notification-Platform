"use client";

import { useState, useEffect } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { theme, font } from "./theme";
import { Sidebar } from "./components/layout/Sidebar";
import { Dashboard } from "./views/Dashboard";
import { Apps } from "./views/Apps";
import { Templates } from "./views/Templates";
import { Send } from "./views/Send";
import { Logs } from "./views/Logs";
import { Scheduled } from "./views/Scheduled";
import { Settings } from "./views/Settings";
import { INITIAL_HISTORY } from "./data/initialData";
import { BulkSend } from "./views/BulkSend";
import { Docs } from "./views/Docs";

export default function App() {
  const [view, setView] = useState("dashboard");
  const [templates, setTemplates] = useState([]);
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const { signOut } = useClerk();
  const { user } = useUser();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/templates");
        const result = await response.json();
        if (result.data) setTemplates(result.data);
      } catch (error) {
        console.error("Failed to load templates:", error);
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", background: theme.bg }}>
      <Sidebar
        view={view}
        setView={setView}
        templateCount={templates.length}
        user={user}
        onSignOut={() => signOut({ redirectUrl: "/sign-in" })}
      />
      <main style={{ flex: 1, overflow: "auto", padding: "36px 40px" }}>
        {view === "dashboard" && <Dashboard templates={templates} history={history} setView={setView} />}
        {view === "apps" && <Apps />}
        {view === "templates" && <Templates templates={templates} setTemplates={setTemplates} loading={loadingTemplates} />}
        {view === "send" && <Send templates={templates} setHistory={setHistory} />}
        {view === "logs" && <Logs />}
        {view === "scheduled" && <Scheduled />}
        {view === "settings" && <Settings />}
        {view === "bulksend" && <BulkSend templates={templates} setHistory={setHistory} />}
        {view === "docs" && <Docs />}
      </main>
    </div>
  );
}