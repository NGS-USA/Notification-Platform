"use client";

import { theme, font } from "../../theme";
import { IconHome, IconFile, IconSend, IconSettings, IconGrid, IconList, IconClock } from "../../icons";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: IconHome },
  { id: "apps", label: "Apps", icon: IconGrid },
  { id: "templates", label: "Templates", icon: IconFile },
  { id: "send", label: "Send", icon: IconSend },
  { id: "logs", label: "Logs", icon: IconList },
  { id: "scheduled", label: "Scheduled", icon: IconClock },
  { id: "settings", label: "Settings", icon: IconSettings },
];

export const Sidebar = ({ view, setView, templateCount }) => (
  <aside style={{ width: 220, background: theme.sidebar, display: "flex", flexDirection: "column", flexShrink: 0 }}>
    <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${theme.sidebarBorder}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, background: "#FFFFFF", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconSend size={14} color="#111111" />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF", margin: 0, fontFamily: font, letterSpacing: "-0.01em" }}>Notifyio</p>
          <p style={{ fontSize: 11, color: "#555555", margin: 0, fontFamily: font }}>Notification Platform</p>
        </div>
      </div>
    </div>

    <nav style={{ padding: "12px 10px", flex: 1 }}>
      {NAV_ITEMS.map((item) => {
        const active = view === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            style={{
              display: "flex", alignItems: "center", gap: 11, width: "100%",
              padding: "9px 12px", borderRadius: 7, border: "none", cursor: "pointer",
              background: active ? "#1E1E1E" : "transparent",
              color: active ? "#FFFFFF" : theme.sidebarText,
              fontFamily: font, fontSize: 13, fontWeight: active ? 500 : 400,
              marginBottom: 2, transition: "all 0.15s", textAlign: "left",
            }}
            onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "#161616"; e.currentTarget.style.color = "#E0E0E0"; } }}
            onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = theme.sidebarText; } }}
          >
            <Icon size={15} color={active ? "#FFFFFF" : theme.sidebarText} />
            {item.label}
            {item.id === "templates" && (
              <span style={{ marginLeft: "auto", fontSize: 11, background: "#222222", color: "#888888", padding: "1px 7px", borderRadius: 9999, fontWeight: 400 }}>
                {templateCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>

    <div style={{ padding: "16px 20px", borderTop: `1px solid ${theme.sidebarBorder}` }}>
      <p style={{ fontSize: 11, color: "#444444", margin: 0, fontFamily: font }}>v0.2.00</p>
    </div>
  </aside>
);