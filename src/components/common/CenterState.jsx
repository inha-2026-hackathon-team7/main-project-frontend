import { COLORS } from "../../constants/colors.js";

export default function CenterState({ icon, title, desc, actionLabel, onAction }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      padding: "56px 20px", color: COLORS.inkSoft, gap: 6,
    }}>
      {icon}
      <div style={{ fontWeight: 800, fontSize: 15.5, color: COLORS.ink, marginTop: 8 }}>{title}</div>
      <div style={{ fontSize: 13.5, lineHeight: 1.55, maxWidth: 260 }}>{desc}</div>
      {actionLabel && (
        <button className="st-btn-ghost" style={{ marginTop: 14 }} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
