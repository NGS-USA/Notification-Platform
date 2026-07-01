"use client";

import { theme, font } from "../../theme";
import { IconHome, IconFile, IconSend, IconSettings, IconGrid, IconList, IconClock, IconUpload } from "../../icons";

const IconLogOut = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: IconHome },
  { id: "apps", label: "Apps", icon: IconGrid },
  { id: "templates", label: "Templates", icon: IconFile },
  { id: "send", label: "Send", icon: IconSend },
  { id: "bulksend", label: "Bulk Send", icon: IconUpload },
  { id: "logs", label: "Logs", icon: IconList },
  { id: "scheduled", label: "Scheduled", icon: IconClock },
  { id: "settings", label: "Settings", icon: IconSettings },
];

export const Sidebar = ({ view, setView, templateCount, user, onSignOut }) => (
  <aside style={{ width: 220, background: theme.sidebar, display: "flex", flexDirection: "column", flexShrink: 0 }}>
    {/* Brand */}
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

    {/* Nav */}
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

    {/* User & Logout */}
    <div style={{ padding: "16px 10px", borderTop: `1px solid ${theme.sidebarBorder}` }}>
      {user && (
        <div style={{ padding: "8px 12px", marginBottom: 4 }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: "#FFFFFF", margin: 0, fontFamily: font, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.firstName || user.emailAddresses?.[0]?.emailAddress}
          </p>
          <p style={{ fontSize: 11, color: "#555555", margin: 0, fontFamily: font, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.emailAddresses?.[0]?.emailAddress}
          </p>
        </div>
      )}
      <button
        onClick={onSignOut}
        style={{
          display: "flex", alignItems: "center", gap: 11, width: "100%",
          padding: "9px 12px", borderRadius: 7, border: "none", cursor: "pointer",
          background: "transparent", color: theme.sidebarText,
          fontFamily: font, fontSize: 13, fontWeight: 400,
          transition: "all 0.15s", textAlign: "left",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#161616"; e.currentTarget.style.color = "#E0E0E0"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = theme.sidebarText; }}
      >
        <IconLogOut size={15} color={theme.sidebarText} />
        Sign Out
      </button>
      <p style={{ fontSize: 11, color: "#444444", margin: "8px 12px 0", fontFamily: font }}>v0.2.06</p>
    </div>
  </aside>
);